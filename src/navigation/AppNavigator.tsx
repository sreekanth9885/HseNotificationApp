// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';

// Import Lucide icons (both outline and filled versions)
import {
  Home,           // outline version
  HomeIcon,       // filled version (some icons have both)
  Bell,           // outline version  
  BellIcon,       // filled version
  User,           // outline version
  UserIcon        // filled version
} from 'lucide-react-native';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: {
    screen?: 'HomeTab' | 'NotificationsTab' | 'ProfileTab';
  };
};

export type HomeTabParamList = {
  HomeTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<HomeTabParamList>();

const HomeTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Method 1: Using separate outline/filled icons
          if (route.name === 'HomeTab') {
            return focused ?
              <HomeIcon size={size} color={color} /> :
              <Home size={size} color={color} />;
          } else if (route.name === 'NotificationsTab') {
            return focused ?
              <BellIcon size={size} color={color} /> :
              <Bell size={size} color={color} />;
          } else if (route.name === 'ProfileTab') {
            return focused ?
              <UserIcon size={size} color={color} /> :
              <User size={size} color={color} />;
          }
          return null;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />

      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{ tabBarLabel: 'Notifications' }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={HomeTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;