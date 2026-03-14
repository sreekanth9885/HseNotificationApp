import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography } from '../theme/colors';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import authService from '../services/auth';
import notificationService from '../services/notificationService';
import { isValidMobileNumber } from '../utils/helpers';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Users, X } from 'lucide-react-native';
// Import Lucide icons
import { Smartphone } from 'lucide-react-native';
import { LoginResponse } from '../types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStudentSelector, setShowStudentSelector] = useState(false);
const [availableStudents, setAvailableStudents] = useState<StudentItem[]>([]);
const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(null);

  const handleLogin = async () => {
  if (!mobileNumber.trim()) {
    setError('Mobile number is required');
    return;
  }
  if (!isValidMobileNumber(mobileNumber)) {
    setError('Please enter a valid 10-digit mobile number');
    return;
  }

  setError('');
  setLoading(true);

  try {
    await notificationService.requestPermissions();
    const result = await authService.login(mobileNumber);
    
    if (result.success) {
      if (result.multiple_accounts && result.students) {
        // Convert Student[] to StudentItem[] by mapping id to string
        const mappedStudents = result.students.map((student: any) => ({
          ...student,
          id: String(student.id),
        }));
        setAvailableStudents(mappedStudents);
        setLoginResponse(result);
        setShowStudentSelector(true);
      } else if (result.user) {
        await authService.registerFCMToken(result.user);
        navigation.replace('MainTabs', { screen: 'HomeTab' });
      }
    } else {
      Alert.alert('Login Failed', result.message || 'Invalid mobile number');
    }
  } catch (error: any) {
    Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};
const handleSelectStudent = async (student: StudentItem) => {
  setShowStudentSelector(false);
  setLoading(true);
  
  try {
    const result = await authService.completeStudentSelection(
      mobileNumber,
      Number(student.id)
    );
    
    if (result.success && result.user) {
      await authService.registerFCMToken(result.user);
      navigation.replace('MainTabs', { screen: 'HomeTab' });
    } else {
      Alert.alert('Error', 'Failed to login with selected student');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to login. Please try again.');
  } finally {
    setLoading(false);
  }
};
interface StudentItem {
  id: string;
  name: string;
  class_name: string;
  section_name: string;
  photo_url?: string;
}

const renderStudentItem = ({ item }: { item: StudentItem }) => (
  <TouchableOpacity
    style={styles.studentCard}
    onPress={() => handleSelectStudent(item)}
  >
    <View style={styles.studentAvatar}>
      {item.photo_url ? (
        <Image source={{ uri: item.photo_url }} style={styles.studentImage} />
      ) : (
        <View style={styles.studentInitials}>
          <Text style={styles.initialsText}>
            {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
      )}
    </View>
    <View style={styles.studentInfo}>
      <Text style={styles.studentName}>{item.name}</Text>
      <Text style={styles.studentClass}>
        Class {item.class_name} - Section {item.section_name}
      </Text>
    </View>
  </TouchableOpacity>
);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>📚</Text>
            </View>
            <Text style={styles.appName}>Student Connect</Text>
            <Text style={styles.tagline}>Stay updated with school notifications</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login with your registered mobile number</Text>

            <Input
              label="Mobile Number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Enter 10-digit mobile number"
              keyboardType="phone-pad"
              leftIcon="smartphone"
              error={error}
              maxLength={10}
            />

            <Button
              title="Login"
              onPress={handleLogin}
              fullWidth
              size="large"
            />

            <Text style={styles.helperText}>
              Use the mobile number registered with your school
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
    <Modal
      visible={showStudentSelector}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Users size={24} color={colors.primary} />
              <Text style={styles.modalTitle}>Select Student</Text>
            </View>
            <TouchableOpacity onPress={() => setShowStudentSelector(false)}>
              <X size={24} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Multiple students found. Please select one:
          </Text>

          <FlatList
            data={availableStudents}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.studentList}
          />

          <Button
            title="Cancel"
            onPress={() => setShowStudentSelector(false)}
            variant="outline"
            fullWidth
          />
        </View>
      </View>
    </Modal>
</>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    ...typography.h2,
    color: colors.white,
    marginBottom: 8,
  },
  tagline: {
    ...typography.body1,
    color: colors.white,
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    marginTop: 40,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcomeText: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textLight,
    marginBottom: 24,
  },
  helperText: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '50%',
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalSubtitle: {
    ...typography.body2,
    color: colors.textLight,
    marginBottom: 24,
  },
  studentList: {
    gap: 12,
    marginBottom: 20,
  },
  studentCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  studentAvatar: {
    marginRight: 16,
  },
  studentImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  studentInitials: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    ...typography.h3,
    color: colors.primary,
  },
  studentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  studentName: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  studentClass: {
    ...typography.caption,
    color: colors.primary,
  },
});

export default LoginScreen;