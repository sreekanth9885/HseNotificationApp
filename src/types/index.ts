export interface User {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  roll_number: string;
  class_id: number;
  class_name: string;
  section_id: number | null;
  section_name: string | null;
  school_id: number;
  father_name: string;
  mother_name: string;
  parent_phone: string;
  alternate_phone: string | null;
  parent_email: string | null;
  photo_url: string | null;
  is_active: boolean;
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
  id: number;
  school_id: number;
  created_by: number;
  title: string;
  body: string;
  type?: string;
  recipient_type: 'single' | 'multiple' | 'class' | 'section' | 'all';
  class_id: number | null;
  section_id: number | null;
  sent_count: number;
  failed_count: number;
  data: any;
  created_at: string;
  is_read?: boolean; // We'll add this client-side
  read_at?: string | null;
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
export interface NotificationHistoryResponse {
  success: boolean;
  history: Notification[];
  total: number;
  page: number;
  pages: number;
}