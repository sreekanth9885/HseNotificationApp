export interface User {
  id: number;
  name: string;
  parent_phone: string;
  class?: string;
  section?: string;
  admission_number?: string;
  school_id?: number;
  father_name?: string;
  mother_name?: string;
  class_id?: number;
  roll_number?: string;
  photo_url?: string;
}
export interface Student {
  id: number;
  name: string;
  class_name: string;
  section_name: string;
  admission_number: string;
  roll_number: string;
  photo_url: string;
}
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'fee' | 'attendance' | 'exam' | 'event' | 'general';
  data?: Record<string, any>;
  created_at: string;
  is_read: boolean;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
}

export interface Class {
  id: number;
  name: string;
}

export interface Section {
  id: number;
  name: string;
  class_id: number;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface LoginResponse {
  token?: string;
  user?: User;
  multiple_accounts?: boolean;
  students?: Student[];
}

export interface DeviceTokenRequest {
  user_id: number;
  token: string;
  platform: 'android' | 'ios';
}

export interface NotificationRequest {
  title: string;
  body: string;
  data?: Record<string, any>;
}