import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { Stack, usePathname, router } from 'expo-router';

export default function TabLayout() {
  const pathname = usePathname();

  useEffect(() => {
    const onBackPress = () => {
      const isHome =
        pathname === '/(tab)/home' ||
        pathname === '/(tab)' ||
        pathname === '/home' ||
        pathname === '/';

      if (isHome) {
        BackHandler.exitApp();
        return true;
      }

      if (pathname.startsWith('/(tab)')) {
        router.replace('/(tab)/home');
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
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="people" />
      <Stack.Screen name="chats" />
      <Stack.Screen name="matches" />
      <Stack.Screen name="likes" />
      <Stack.Screen name="me" />
      <Stack.Screen name="home" />
      <Stack.Screen name="explore" />
    </Stack>
  );
}
