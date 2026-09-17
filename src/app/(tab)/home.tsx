import React, { useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from 'expo-router';
import DatingProfileScreen from '@/components/DatingProfileScreen';
import { setUserLoggedIn } from '@/utils/authPersistence';

export default function HomeScreen() {
  useEffect(() => {
    // Ensure auth state is marked as logged in and onboarding completed
    setUserLoggedIn(true, { isOnboardingCompleted: true });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  return <DatingProfileScreen />;
}
