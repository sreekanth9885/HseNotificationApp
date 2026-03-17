import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';

import { colors, typography } from '../theme/colors';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import authService from '../services/auth';
import notificationService from '../services/notificationService';

import { User, NotificationStats } from '../types';

import {
  ArrowLeft,
  Phone,
  User as UserIcon,
  GraduationCap,
  Hash,
  Bell,
  BellRing,
  CircleCheckBig,
} from 'lucide-react-native';

type RootStackParamList = {
  Profile: undefined;
  Login: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Profile'
>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<NotificationStats>({
    totalNotifications: 0,
    unreadNotifications: 0,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);

      const notifications = await notificationService.getNotifications();

      setStats({
        totalNotifications: notifications.length,
        unreadNotifications: notifications.filter(n => !n.is_read).length,
      });
    } catch (error) {
      console.log('Profile load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.avatar}
          >
            {user?.photo_url ? (
              <Image
                source={{ uri: `https://api.academicprojects.org/${user.photo_url}` }}
                style={styles.avatarImage}
              />
            ) : (
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
            )}
          </LinearGradient>

          <Text style={styles.name}>{user?.name}</Text>

          <View style={styles.row}>
            <Phone size={16} color={colors.textLight} />
            <Text style={styles.mobile}>{user?.parent_phone}</Text>
          </View>
        </View>

        {/* STUDENT INFO */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Student Information</Text>

          <View style={styles.infoRow}>
            <Hash size={16} color={colors.textLight} />
            <Text style={styles.infoText}>
              Admission No: {user?.admission_number}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <GraduationCap size={16} color={colors.textLight} />
            <Text style={styles.infoText}>
              Class Name: {user?.class_name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Hash size={16} color={colors.textLight} />
            <Text style={styles.infoText}>
              Roll Number: {user?.roll_number}
            </Text>
          </View>
        </View>

        {/* PARENT INFO */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Parent Details</Text>

          <View style={styles.infoRow}>
            <UserIcon size={16} color={colors.textLight} />
            <Text style={styles.infoText}>
              Father: {user?.father_name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <UserIcon size={16} color={colors.textLight} />
            <Text style={styles.infoText}>
              Mother: {user?.mother_name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Phone size={16} color={colors.textLight} />
            <Text style={styles.infoText}>
              Parent Phone: {user?.parent_phone}
            </Text>
          </View>
        </View>

        {/* NOTIFICATION STATS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notification Statistics</Text>

          <View style={styles.statsRow}>

            <View style={styles.statItem}>
              <Bell size={24} color={colors.primary} />
              <Text style={styles.statValue}>
                {stats.totalNotifications}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={styles.statItem}>
              <BellRing size={24} color={colors.warning} />
              <Text style={styles.statValue}>
                {stats.unreadNotifications}
              </Text>
              <Text style={styles.statLabel}>Unread</Text>
            </View>

            <View style={styles.statItem}>
              <CircleCheckBig size={24} color={colors.success} />
              <Text style={styles.statValue}>
                {stats.totalNotifications - stats.unreadNotifications}
              </Text>
              <Text style={styles.statLabel}>Read</Text>
            </View>

          </View>
        </View>

        {/* LOGOUT */}
        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            size="large"
          />
        </View>

        <Text style={styles.version}>
          Student Connect v1.0.0
        </Text>

      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
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

  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 24,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  avatarText: {
    fontSize: 40,
    color: colors.white,
    fontWeight: 'bold',
  },

  name: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  mobile: {
    ...typography.body1,
    color: colors.textLight,
  },

  card: {
    backgroundColor: colors.white,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },

  cardTitle: {
    ...typography.h3,
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },

  infoText: {
    ...typography.body2,
    color: colors.text,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    ...typography.h3,
    marginTop: 6,
  },

  statLabel: {
    ...typography.caption,
    color: colors.textLight,
  },

  logoutSection: {
    padding: 20,
  },

  version: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: 30,
    color: colors.textLight,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  }
});