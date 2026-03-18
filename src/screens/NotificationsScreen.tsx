import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography } from '../theme/colors';
import NotificationCard from '../components/NotificationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import notificationService from '../services/notificationService';
import { Notification } from '../types';
import {
  ArrowLeft,
  Delete,
  BellOff,
  Trash2,
  Bell,
  BellRing,
  ChevronLeft
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
type NotificationsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MainTabs'
  >;
interface NotificationsScreenProps {
  navigation: NotificationsScreenNavigationProp;
}
const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    loadNotifications();
  }, []);
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
    await notificationService.markAsRead(notification.id);
    loadNotifications();
    if (!notification.data?.screen) return;
    const screenMap: any = {
      home: 'HomeTab',
      notifications: 'NotificationsTab',
      profile: 'ProfileTab',
    };
    const route = screenMap[notification.data.screen.toLowerCase()];
    if (route) {
      navigation.navigate('MainTabs', { screen: route });
    }
  };
  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            loadNotifications();
          },
        },
      ]
    );
  };
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Trash2 size={24} color={colors.danger} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.statsBar}>
        <View style={styles.statsContainer}>
          <BellRing size={16} color={colors.warning} strokeWidth={1.5} />
          <Text style={styles.statsText}>
            {unreadCount} unread
          </Text>
        </View>
        <View style={styles.statsContainer}>
          <Bell size={16} color={colors.primary} strokeWidth={1.5} />
          <Text style={styles.statsText}>
            {notifications.length} total
          </Text>
        </View>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <BellOff size={64} color={colors.gray[300]} strokeWidth={1.5} />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateText}>
              You don't have any notifications yet.
            </Text>
          </View>
        }
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  clearButton: {
    padding: 8,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsText: {
    ...typography.body2,
    color: colors.textLight,
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
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
  },
});

export default NotificationsScreen;