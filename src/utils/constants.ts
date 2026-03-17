export const API_BASE_URL = 'https://api.academicprojects.org'; // Replace with your actual API URL

export const NOTIFICATION_TYPES = {
  FEE: 'fee' as const,
  ATTENDANCE: 'attendance' as const,
  EXAM: 'exam' as const,
  EVENT: 'event' as const,
  GENERAL: 'general' as const,
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case NOTIFICATION_TYPES.FEE:
      return 'cash';
    case NOTIFICATION_TYPES.ATTENDANCE:
      return 'calendar-check';
    case NOTIFICATION_TYPES.EXAM:
      return 'school';
    case NOTIFICATION_TYPES.EVENT:
      return 'party-popper';
    default:
      return 'bell';
  }
};

export const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case NOTIFICATION_TYPES.FEE:
      return '#10B981';
    case NOTIFICATION_TYPES.ATTENDANCE:
      return '#3B82F6';
    case NOTIFICATION_TYPES.EXAM:
      return '#F59E0B';
    case NOTIFICATION_TYPES.EVENT:
      return '#8B5CF6';
    default:
      return '#4F46E5';
  }
};

export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  NOTIFICATIONS: 'notifications',
  SCHOOL_ID: 'school_id',
  DEVICE_REGISTERED: 'device_registered',
  FCM_TOKEN: 'fcm_token',
  READ_NOTIFICATIONS: 'read_notifications',
} as const;
