// App.tsx
import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox, View, Text } from 'react-native';

// Import Firebase config first
import './src/config/firebase';

import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';
import notificationService from './src/services/notificationService';
import { SafeAreaView } from 'react-native-safe-area-context';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Remote debugger',
  'deprecated',
  'SafeAreaView',
  'InteractionManager'
]);

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 App starting...');

        // Wait a moment for Firebase to fully initialize
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
        // Initialize notification service
        console.log('📱 Initializing notification service...');
        await notificationService.initialize();

        console.log('✅ App ready!');
      } catch (error) {
        console.error('❌ App initialization error:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white
      }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <AppNavigator />
      </SafeAreaView>
    </>
  );
};

export default App;