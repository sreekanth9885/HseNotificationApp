// services/notificationService.ts
import api from './api';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { Notification, NotificationHistoryResponse } from '../types';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

class NotificationService {
  private listeners: ((notification: Notification) => void)[] = [];
  private notificationOpenedListener: any = null;
  private messageListener: any = null;

  /**
   * Get notifications from API
   */
  async getNotifications(
    page: number = 1,
    limit: number = 20,
  ): Promise<Notification[]> {
    try {
      const response = await api.get<NotificationHistoryResponse>(
        `/notifications/history?page=${page}&limit=${limit}`,
      );

      if (response.success && response.history) {
        // Get read status from local storage
        const readStatus = await this.getReadStatus();

        // Add is_read property to each notification
        const notificationsWithReadStatus = response.history.map(
          notification => ({
            ...notification,
            is_read: readStatus[notification.id] || false,
          }),
        );

        // Cache notifications in storage
        await this.cacheNotifications(notificationsWithReadStatus);

        return notificationsWithReadStatus;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Return cached notifications if API fails
      return await this.getCachedNotifications();
    }
  }

  /**
   * Get more notifications (pagination)
   */
  async getMoreNotifications(
    page: number,
    limit: number = 20,
  ): Promise<{
    notifications: Notification[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await api.get<NotificationHistoryResponse>(
        `/notifications/history?page=${page}&limit=${limit}`,
      );

      if (response.success) {
        // Get read status from local storage
        const readStatus = await this.getReadStatus();

        // Add is_read property to each notification
        const notificationsWithReadStatus = response.history.map(
          notification => ({
            ...notification,
            is_read: readStatus[notification.id] || false,
          }),
        );

        return {
          notifications: notificationsWithReadStatus,
          total: response.total,
          pages: response.pages,
        };
      }

      return { notifications: [], total: 0, pages: 0 };
    } catch (error) {
      console.error('Failed to fetch more notifications:', error);
      return { notifications: [], total: 0, pages: 0 };
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number): Promise<boolean> {
    try {
      // For now, we'll just store read status locally
      // You can implement an API endpoint for this later
      const readStatus = await this.getReadStatus();
      readStatus[notificationId] = true;
      await storage.setItem(STORAGE_KEYS.READ_NOTIFICATIONS, readStatus);

      // Update cached notifications
      const cached = await this.getCachedNotifications();
      const updated = cached.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n,
      );
      await this.cacheNotifications(updated);

      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const cached = await this.getCachedNotifications();
      const readStatus: Record<number, boolean> = {};

      cached.forEach(n => {
        readStatus[n.id] = true;
      });

      await storage.setItem(STORAGE_KEYS.READ_NOTIFICATIONS, readStatus);

      // Update cached notifications
      const updated = cached.map(n => ({ ...n, is_read: true }));
      await this.cacheNotifications(updated);

      return true;
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      return false;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getCachedNotifications();
      return notifications.filter(n => !n.is_read).length;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Get read status from storage
   */
  private async getReadStatus(): Promise<Record<number, boolean>> {
    try {
      return (
        (await storage.getItem<Record<number, boolean>>(
          STORAGE_KEYS.READ_NOTIFICATIONS,
        )) || {}
      );
    } catch {
      return {};
    }
  }

  /**
   * Cache notifications in storage
   */
  private async cacheNotifications(
    notifications: Notification[],
  ): Promise<void> {
    await storage.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  /**
   * Get cached notifications
   */
  private async getCachedNotifications(): Promise<Notification[]> {
    try {
      return (
        (await storage.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS)) ||
        []
      );
    } catch {
      return [];
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permissions granted');
        return true;
      }

      console.log('Notification permissions denied');
      return false;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  /**
   * Setup notification listeners
   */
  setupListeners(
    onNotification: (notification: Notification) => void,
    onNotificationOpened: (notification: Notification) => void,
  ): () => void {
    // Handle notifications when app is in foreground
    this.messageListener = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification received:', remoteMessage);

      const notification = this.parseRemoteMessage(remoteMessage);
      onNotification(notification);

      // Refresh notifications list
      this.getNotifications();
    });

    // Handle notifications when app is opened from background
    this.notificationOpenedListener = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('Notification opened from background:', remoteMessage);

        const notification = this.parseRemoteMessage(remoteMessage);
        onNotificationOpened(notification);
      },
    );

    // Handle notifications when app is opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification opened from quit state:', remoteMessage);

          const notification = this.parseRemoteMessage(remoteMessage);
          onNotificationOpened(notification);
        }
      });

    return this.removeListeners;
  }

  /**
   * Parse remote message to Notification object
   */
  private parseRemoteMessage(remoteMessage: any): Notification {
    return {
      id: parseInt(remoteMessage.data?.notification_id || '0'),
      school_id: parseInt(remoteMessage.data?.school_id || '0'),
      created_by: parseInt(remoteMessage.data?.created_by || '0'),
      title:
        remoteMessage.notification?.title || remoteMessage.data?.title || '',
      body: remoteMessage.notification?.body || remoteMessage.data?.body || '',
      recipient_type: remoteMessage.data?.recipient_type || 'single',
      class_id: remoteMessage.data?.class_id
        ? parseInt(remoteMessage.data.class_id)
        : null,
      section_id: remoteMessage.data?.section_id
        ? parseInt(remoteMessage.data.section_id)
        : null,
      sent_count: 1,
      failed_count: 0,
      data: remoteMessage.data
        ? JSON.parse(remoteMessage.data.data || '{}')
        : {},
      created_at: new Date().toISOString(),
      is_read: false,
    };
  }

  /**
   * Remove listeners
   */
  private removeListeners = () => {
    if (this.messageListener) {
      this.messageListener();
    }
    if (this.notificationOpenedListener) {
      this.notificationOpenedListener();
    }
  };
}

export default new NotificationService();