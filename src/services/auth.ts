import api from './api';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { User, LoginResponse } from '../types';
import messaging from '@react-native-firebase/messaging';
import { getPlatform } from '../utils/helpers';
interface Student {
  id: number;
  name: string;
  class_name: string;
  section_name: string;
  admission_number: string;
  roll_number: string;
  photo_url: string;
}
class AuthService {
  async login(mobileNumber: string): Promise<{ 
  success: boolean; 
  user?: User; 
  message?: string;
  multiple_accounts?: boolean;
  students?: Student[];
}> {
  try {
    const response = await api.post<LoginResponse & { 
      multiple_accounts?: boolean; 
      students?: Student[] 
    }>('/auth/student-login', {
      mobile_number: mobileNumber,
    });
    
    const { token, user, multiple_accounts, students } = response;
    
    if (multiple_accounts) {
      return { 
        success: true, 
        multiple_accounts: true, 
        students 
      };
    }
    
    await storage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    await storage.setItem(STORAGE_KEYS.USER_DATA, user);
    if (user?.school_id) {
      await storage.setItem(STORAGE_KEYS.SCHOOL_ID, user.school_id.toString());
    }
    
    return { success: true, user };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed',
    };
  }
}
async completeStudentSelection(
  mobileNumber: string, 
  studentId: number
): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const response = await api.post<LoginResponse>('/auth/select-student', {
      mobile_number: mobileNumber,
      student_id: studentId
    });
    
    const { token, user } = response;
    
    await storage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    await storage.setItem(STORAGE_KEYS.USER_DATA, user);
    if (user?.school_id) {
      await storage.setItem(STORAGE_KEYS.SCHOOL_ID, user.school_id.toString());
    }
    
    return { success: true, user };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to select student',
    };
  }
}
  async logout(): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        // Unregister device on logout
        await this.unregisterFCMToken(user);
      }
      await api.post('/auth/student-logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await storage.removeItem(STORAGE_KEYS.USER_TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
      await storage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      await storage.removeItem(STORAGE_KEYS.SCHOOL_ID);
    }
  }

  async registerFCMToken(user: User): Promise<void> {
    try {
      const token = await messaging().getToken();
      
      if (token) {
        // Get school_id from user object
        const school_id = user.school_id;
        
        if (!school_id) {
          console.error('No school_id found in user object');
          return;
        }

        const payload = {
          user_id: user.id,
          token: token,
          platform: getPlatform(),
          school_id: school_id, // Add school_id from user
        };

        console.log('📤 Registering device with payload:', payload);

        const response = await api.post<{ data: any }>('/register-device', payload);
        console.log('✅ Device registered successfully:', response?.data);
        
        // Store that device is registered
        await storage.setItem(STORAGE_KEYS.DEVICE_REGISTERED, 'true');
      }
    } catch (error: any) {
      console.error('FCM token registration failed:', error.response?.data || error.message);
    }
  }

  async unregisterFCMToken(user: User): Promise<void> {
    try {
      const token = await messaging().getToken();
      
      if (token && user) {
        await api.post('/unregister-device', {
          user_id: user.id,
          token: token,
          school_id: user.school_id,
        });
      }
    } catch (error) {
      console.error('FCM token unregistration failed:', error);
    }
  }

  async refreshFCMToken(user: User): Promise<void> {
    try {
      // First unregister old token
      await this.unregisterFCMToken(user);
      
      // Then register new token
      await this.registerFCMToken(user);
      
      console.log('✅ FCM token refreshed successfully');
    } catch (error) {
      console.error('FCM token refresh failed:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return await storage.getItem<User>(STORAGE_KEYS.USER_DATA);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await storage.getItem<string>(STORAGE_KEYS.USER_TOKEN);
    return !!token;
  }

  async updateUser(user: User): Promise<void> {
    await storage.setItem(STORAGE_KEYS.USER_DATA, user);
    if (user.school_id) {
      await storage.setItem(STORAGE_KEYS.SCHOOL_ID, user.school_id.toString());
    }
  }
}

export default new AuthService();