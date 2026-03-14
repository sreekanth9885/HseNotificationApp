import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, typography } from '../theme/colors';
import NotificationCard from '../components/NotificationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import authService from '../services/auth';
import notificationService from '../services/notificationService';
import { Notification, User } from '../types';

// Import Lucide icons
import {
  Bell,
  BellOff,
  CheckCircle,
  User as UserIcon,
  ArrowRight,
  BellRing,
  CircleCheckBig,
  UserCircle
} from 'lucide-react-native';

type HomeTabParamList = {
  HomeTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

type HomeScreenNavigationProp = BottomTabNavigationProp<HomeTabParamList, 'HomeTab'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUserData();
    loadNotifications();
    
    // Setup notification listener
    const unsubscribe = notificationService.setupListeners(
      (newNotification) => {
        // New notification received
        loadNotifications();
      },
      (openedNotification) => {
        // Handle notification press
        handleNotificationPress(openedNotification);
      }
    );

    return unsubscribe;
  }, []);

  const loadUserData = async () => {
    const userData = await authService.getCurrentUser();
    setUser(userData);
  };

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    await notificationService.markAsRead(notification.id);
    loadNotifications();
    
    // Navigate based on notification type
    if (notification.data?.screen) {
      const screen = notification.data.screen;

      const screenMap: any = {
        home: 'HomeTab',
        notifications: 'NotificationsTab',
        profile: 'ProfileTab',
      };

      const route = screenMap[screen.toLowerCase()];

      if (route) {
        navigation.navigate(route);
      }
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    loadNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name || 'Student'}!</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('ProfileTab')}
        >
          <UserCircle size={40} color={colors.primary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: `${colors.primary}10` }]}>
          <Bell size={24} color={colors.primary} strokeWidth={1.5} />
          <Text style={styles.statNumber}>{notifications.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: `${colors.warning}10` }]}>
          <BellRing size={24} color={colors.warning} strokeWidth={1.5} />
          <Text style={styles.statNumber}>{unreadCount}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: `${colors.success}10` }]}>
          <CircleCheckBig size={24} color={colors.success} strokeWidth={1.5} />
          <Text style={styles.statNumber}>{notifications.length - unreadCount}</Text>
          <Text style={styles.statLabel}>Read</Text>
        </View>
      </View>

      {/* Notifications Header */}
      <View style={styles.notificationsHeader}>
        <Text style={styles.sectionTitle}>Recent Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.notificationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <BellOff size={64} color={colors.gray[300]} strokeWidth={1.5} />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateText}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onPress={() => handleNotificationPress(notification)}
            />
          ))
        )}
        
        {notifications.length > 10 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('NotificationsTab')}
          >
            <Text style={styles.viewAllText}>View All Notifications</Text>
            <ArrowRight size={20} color={colors.primary} strokeWidth={1.5} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    ...typography.body1,
    color: colors.textLight,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
    marginTop: 2,
  },
  date: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 1,
  },
  statCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 100,
  },
  statNumber: {
    ...typography.h3,
    marginTop: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textLight,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  markAllText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '500',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    ...typography.body2,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewAllText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '500',
    marginRight: 8,
  },
});

export default HomeScreen;