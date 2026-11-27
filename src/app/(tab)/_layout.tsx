import React, { useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { Stack, useFocusEffect, usePathname, router } from 'expo-router';
import { registerForPushNotifications } from '@/services/notificationService';
import { authStorage } from '@/services/authStorage';
import { resetNavigationToLogin } from '@/utils/sessionNavigation';

export default function TabLayout() {
  const pathname = usePathname();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void authStorage.getToken().then((token) => {
        if (active && !token) {
          resetNavigationToLogin();
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  useEffect(() => {
    void registerForPushNotifications();
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      const isHome =
        pathname === '/(tab)/matches' ||
        pathname === '/matches' ||
        pathname === '/(tab)' ||
        pathname === '/';

      if (isHome) {
        BackHandler.exitApp();
        return true;
      }

      if (pathname.startsWith('/(tab)')) {
        router.replace('/(tab)/matches');
        return true;
      }

      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => subscription.remove();
  }, [pathname]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }} initialRouteName="matches">
      <Stack.Screen name="matches" />
      <Stack.Screen name="likes" />
      <Stack.Screen name="people" />
      <Stack.Screen name="chats" />
      <Stack.Screen name="me" />
    </Stack>
  );
}
