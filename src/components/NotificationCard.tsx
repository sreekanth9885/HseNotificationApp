import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle,
  Award,
  Calendar,
  MessageCircle,
  ShoppingBag,
  TrendingUp,
  Users,
  Clock,
  FileText,
  Heart,
  Star,
  Zap
} from 'lucide-react-native';
import { colors, typography } from '../theme/colors';
import { Notification } from '../types';
import { getNotificationIcon, getNotificationColor, NOTIFICATION_TYPES, NotificationType } from '../utils/constants';
import { getTimeAgo } from '../utils/helpers';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  style?: ViewStyle;
}
const iconMap = {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Award,
  Calendar,
  MessageCircle,
  ShoppingBag,
  TrendingUp,
  Users,
  Clock,
  FileText,
  Heart,
  Star,
  Zap,
} as const;
type IconName = keyof typeof iconMap;
const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  style,
}) => {
  const { title, body, type, created_at, is_read } = notification;
  const notificationType = (type || NOTIFICATION_TYPES.GENERAL) as NotificationType;
  const iconName = getNotificationIcon(notificationType) as IconName;
  const iconColor = getNotificationColor(notificationType);
  const timeAgo = getTimeAgo(created_at);
  const IconComponent = iconMap[iconName];
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in iconMap`);
    return (
      <TouchableOpacity
        style={[
          styles.container,
          !is_read && styles.unreadContainer,
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Bell size={24} color={iconColor} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, !is_read && styles.unreadTitle]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.timeText}>{timeAgo}</Text>
          </View>
          <Text style={styles.body} numberOfLines={2}>
            {body}
          </Text>
          {!is_read && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      style={[
        styles.container,
        !is_read && styles.unreadContainer,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <IconComponent size={24} color={iconColor} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !is_read && styles.unreadTitle]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>
        
        <Text style={styles.body} numberOfLines={2}>
          {body}
        </Text>
        
        {!is_read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadContainer: {
    backgroundColor: `${colors.primaryLight}10`,
    borderColor: colors.primaryLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  body: {
    ...typography.body2,
    color: colors.textLight,
  },
  timeText: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: 8,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});

export default NotificationCard;