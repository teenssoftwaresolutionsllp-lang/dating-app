import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
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
import * as Notifications from 'expo-notifications';
import { authStorage } from '@/services/authStorage';
import { registerForPushNotifications } from '@/services/notificationService';

if (Platform.OS !== 'web') {
  void SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
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

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Register device push token if user is authenticated
    authStorage.getToken().then((token) => {
      if (token) {
        void registerForPushNotifications();
      }
    });

    // Listen for notification responses when user taps incoming call push notification
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === 'INCOMING_CALL' && data.callId) {
        console.log('[PushNotification] User tapped incoming call push notification:', data);
      } else if (data?.type === 'NEW_MESSAGE') {
        router.push('/(tab)/chats' as any);
      } else if (data?.type === 'NEW_MATCH') {
        router.push('/(tab)/matches' as any);
      }
    });

    return () => {
      responseSub.remove();
    };
  }, []);

  if (!fontsLoaded && !fontError && Platform.OS !== 'web') {
    return null;
  }

  const content = (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {Platform.OS !== 'web' && <AnimatedSplashOverlay />}
      <IncomingCallOverlay />
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