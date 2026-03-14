// services/notificationService.ts
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';
import {
  STORAGE_KEYS,
  NOTIFICATION_TYPES,
  NotificationType,
} from '../utils/constants';
import { Notification } from '../types';

class NotificationService {
  private initialized = false;

  async initialize(): Promise<void> {
  if (this.initialized) return;

  try {
    console.log('📱 Initializing NotificationService...');

    await this.createDefaultChannel();

    this.initialized = true;

    console.log('✅ NotificationService initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize NotificationService:', error);
  }
}

  // Android notification channel
  private async createDefaultChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
      console.log('✅ Default notification channel created');
    }
  }

  // Request permissions - call this explicitly when needed
  async requestPermissions(): Promise<boolean> {
    try {
      console.log('🔐 Requesting notification permissions...');

      // Request Firebase messaging permission
      const authStatus = await messaging().requestPermission();

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      // Request notifee permission (Android 13+)
      await notifee.requestPermission();

      console.log('✅ Notification permissions granted:', enabled);
      return enabled;
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      return false;
    }
  }

  // Get FCM token
  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log('📱 FCM Token obtained');
      return token;
    } catch (error) {
      console.error('❌ Failed to get FCM token:', error);
      return null;
    }
  }

  // Delete FCM token (useful for logout)
  async deleteFCMToken(): Promise<void> {
    try {
      await messaging().deleteToken();
      console.log('✅ FCM Token deleted');
    } catch (error) {
      console.error('❌ Failed to delete FCM token:', error);
    }
  }

  // Set up notification listeners
  setupListeners(
    onNotification?: (notification: Notification) => void,
    onNotificationOpened?: (notification: Notification) => void,
  ): () => void {
    console.log('📡 Setting up notification listeners...');

    // Foreground messages
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('📨 Foreground message received');
      const notification =
        this.createNotificationFromRemoteMessage(remoteMessage);

      await this.displayLocalNotification(notification);
      await this.saveNotification(notification);

      if (onNotification) {
        onNotification(notification);
      }
    });

    // App opened from background via notification
    const unsubscribeOnOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('📨 App opened from background via notification');
        const notification =
          this.createNotificationFromRemoteMessage(remoteMessage);

        if (onNotificationOpened) {
          onNotificationOpened(notification);
        }
      },
    );

    // App opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage && onNotificationOpened) {
          console.log('📨 App opened from quit state via notification');
          const notification =
            this.createNotificationFromRemoteMessage(remoteMessage);
          onNotificationOpened(notification);
        }
      });

    return () => {
      console.log('🔌 Cleaning up notification listeners');
      unsubscribeOnMessage();
      unsubscribeOnOpened();
    };
  }

  // Register background message handler
  // private registerBackgroundHandler(): void {
  //   console.log('🔄 Registering background message handler...');
  //   messaging().setBackgroundMessageHandler(async remoteMessage => {
  //     console.log('📨 Background message received');
  //     const notification =
  //       this.createNotificationFromRemoteMessage(remoteMessage);
  //     await this.displayLocalNotification(notification);
  //     await this.saveNotification(notification);
  //   });
  // }

  // Display local notification using notifee
  private async displayLocalNotification(
    notification: Notification,
  ): Promise<void> {
    await notifee.displayNotification({
      title: notification.title,
      body: notification.body,
      android: {
        channelId: 'default',
        pressAction: { id: 'default' },
      },
      data: notification.data,
    });
  }

  // Create notification object from remote message
  private createNotificationFromRemoteMessage(
    remoteMessage: any,
  ): Notification {
    return {
      id: remoteMessage.messageId || Date.now().toString(),
      title: remoteMessage.notification?.title || '',
      body: remoteMessage.notification?.body || '',
      type:
        (remoteMessage.data?.type as NotificationType) ||
        NOTIFICATION_TYPES.GENERAL,
      data: remoteMessage.data,
      created_at: new Date().toISOString(),
      is_read: false,
    };
  }

  // Save notification to storage
  async saveNotification(notification: Notification): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      notifications.unshift(notification);
      await storage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        notifications.slice(0, 50),
      );
    } catch (error) {
      console.error('❌ Failed to save notification:', error);
    }
  }

  // Get all notifications
  async getNotifications(): Promise<Notification[]> {
    return (
      (await storage.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS)) || []
    );
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n,
      );
      await storage.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updated = notifications.map(n => ({ ...n, is_read: true }));
      await storage.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
    }
  }

  // Clear all notifications
  async clearNotifications(): Promise<void> {
    await storage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    console.log('✅ Notifications cleared');
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.is_read).length;
  }
}

export default new NotificationService();
