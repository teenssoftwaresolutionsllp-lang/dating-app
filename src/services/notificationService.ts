import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiRequest } from './api';
import { authStorage } from './authStorage';

let lastRegisteredPushToken: string | null = null;

export function getLastRegisteredPushToken(): string | null {
  return lastRegisteredPushToken;
}

export async function dismissAllAppNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch {
    // Non-blocking cleanup
  }
}

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register the device for push notifications (APNs / FCM / Expo) and sync push token with backend
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const token = await authStorage.getToken();
    if (!token) {
      // User not authenticated yet; registration will occur upon login
      return null;
    }

    // Set up Android notification channels
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('calls', {
        name: 'Incoming Calls',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 500, 500],
        lightColor: '#FF2D55',
        sound: 'default',
        enableVibrate: true,
      });

      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default Notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.info('[NotificationService] Push notification permissions not granted.');
      return null;
    }

    // Retrieve device push token (FCM for native Android build, Expo push token for Expo Go / dev)
    let pushToken: string | null = null;
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      'a5128713-816b-4d3f-afe6-d6fe58c553d0';

    try {
      const tokenData = await Notifications.getDevicePushTokenAsync();
      pushToken = tokenData.data;
    } catch (tokenErr) {
      // In development / Expo Go, fallback to Expo push token if getDevicePushTokenAsync is unsupported
      try {
        const expoTokenData = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );
        pushToken = expoTokenData.data;
      } catch (expoErr) {
        console.warn('[NotificationService] Could not retrieve device push token:', tokenErr, expoErr);
      }
    }

    if (!pushToken) return null;

    lastRegisteredPushToken = pushToken;
    console.info(`[NotificationService] Registering push token on backend: ${pushToken.slice(0, 18)}...`);

    // Send push token to backend
    await apiRequest('/api/v1/users/push-token', {
      method: 'POST',
      body: JSON.stringify({
        pushToken,
        platform: Platform.OS,
      }),
    });

    return pushToken;
  } catch (err) {
    console.warn('[NotificationService] Push registration failed:', err);
    return null;
  }
}
