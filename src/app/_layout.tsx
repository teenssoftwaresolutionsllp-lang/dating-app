import React, { useCallback, useEffect } from 'react';
import { Stack, router, usePathname } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Platform, View, StyleSheet } from 'react-native';
import '@/i18n';
import { LanguageProvider } from '@/context/LanguageContext';
import '@/global.css';

import { IncomingCallOverlay } from '@/components/IncomingCallOverlay';
import { AppToastOverlay } from '@/components/AppToast';
import * as Notifications from 'expo-notifications';
import { authStorage } from '@/services/authStorage';
import {
  dismissAllAppNotifications,
  registerForPushNotifications,
} from '@/services/notificationService';
import {
  isProtectedRoute,
  resetNavigationToLogin,
} from '@/utils/sessionNavigation';

if (Platform.OS !== 'web') {
  void SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const pathname = usePathname();
  const [fontsLoaded, fontError] = useFonts({
    DM_Sans_400Regular: DMSans_400Regular,
    DM_Sans_500Medium: DMSans_500Medium,
    DM_Sans_700Bold: DMSans_700Bold,
    DM_Serif_Display_400Regular: DMSerifDisplay_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded, fontError]);

  // Global Auth Guard: prevent viewing any protected route when logged out / deleted / deactivated
  useEffect(() => {
    if (!isProtectedRoute(pathname)) return;

    let active = true;
    void authStorage.getToken().then((token) => {
      if (active && !token) {
        void dismissAllAppNotifications();
        resetNavigationToLogin();
      }
    });

    return () => {
      active = false;
    };
  }, [pathname]);

  const handleNotificationResponse = useCallback(
    async (response: Notifications.NotificationResponse | null | undefined) => {
      const data = response?.notification?.request?.content?.data as
        | Record<string, any>
        | undefined;
      if (!data) return;

      const token = await authStorage.getToken();
      if (!token) {
        // Logged out, deactivated, or deleted: never open chats/matches from an old banner
        await dismissAllAppNotifications();
        resetNavigationToLogin();
        return;
      }

      // Check recipientId so another user logged into the same phone doesn't open old account alerts
      const targetRecipientId =
        typeof data.recipientId === 'string' ? data.recipientId : undefined;
      if (targetRecipientId) {
        const currentUserId = await authStorage.getUserId();
        if (currentUserId && targetRecipientId !== currentUserId) {
          await dismissAllAppNotifications();
          return;
        }
      }

      if (data.type === 'INCOMING_CALL' && data.callId) {
        console.log('[PushNotification] User tapped incoming call push notification:', data);
      } else if (data.type === 'NEW_MESSAGE') {
        router.push('/(tab)/chats' as any);
      } else if (data.type === 'NEW_MATCH' || data.type === 'NEW_LIKE') {
        router.push(data.type === 'NEW_LIKE' ? ('/(tab)/likes' as any) : ('/(tab)/matches' as any));
      }
    },
    [],
  );

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Register device push token if user is authenticated
    authStorage.getToken().then((token) => {
      if (token) {
        void registerForPushNotifications();
      }
    });

    // Handle notification tap when app launches cold from killed state
    void Notifications.getLastNotificationResponseAsync().then((lastResponse) => {
      if (lastResponse) {
        void handleNotificationResponse(lastResponse);
      }
    });

    // Listen for notification taps while app is running or backgrounded
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      void handleNotificationResponse(response);
    });

    return () => {
      responseSub.remove();
    };
  }, [handleNotificationResponse]);

  if (!fontsLoaded && !fontError && Platform.OS !== 'web') {
    return null;
  }

  const content = (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      </Stack>
      {Platform.OS !== 'web' && <AnimatedSplashOverlay />}
      <IncomingCallOverlay />
      <AppToastOverlay />
    </>
  );

  return (
    <SafeAreaProvider style={styles.provider}>
      <LanguageProvider>
        {Platform.OS === 'web' ? (
          <View style={styles.webOuterContainer}>
            <View style={styles.webAppContainer}>
              {content}
            </View>
          </View>
        ) : (
          content
        )}
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  provider: {
    flex: 1,
  },
  webOuterContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webAppContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    height: '100%',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
  },
});