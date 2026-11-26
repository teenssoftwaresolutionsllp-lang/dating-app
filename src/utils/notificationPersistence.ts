import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { apiRequest } from '@/services/api';
import { authStorage } from '@/services/authStorage';

const NOTIFICATION_SETTINGS_FILE = 'user_notification_settings.json';

export interface NotificationSettingsMap {
  push: boolean;
  matches: boolean;
  messages: boolean;
  likes: boolean;
  profileViews: boolean;
  reminders: boolean;
  promotions: boolean;
  [key: string]: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsMap = {
  push: true,
  matches: true,
  messages: true,
  likes: true,
  profileViews: true,
  reminders: true,
  promotions: true,
};

export async function getNotificationSettings(): Promise<NotificationSettingsMap> {
  let localSettings = DEFAULT_NOTIFICATION_SETTINGS;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(NOTIFICATION_SETTINGS_FILE);
        if (raw) {
          localSettings = { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
        }
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${NOTIFICATION_SETTINGS_FILE}`;
      const info = await FileSystem.getInfoAsync(filePath);
      if (info.exists) {
        const raw = await FileSystem.readAsStringAsync(filePath);
        if (raw) {
          localSettings = { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
        }
      }
    }
  } catch {
    // Keep default local settings on failure
  }

  try {
    const token = await authStorage.getToken();
    if (token) {
      const remote = await apiRequest<{
        pushEnabled?: boolean;
        newMatches?: boolean;
        newMessages?: boolean;
        newLikes?: boolean;
        marketing?: boolean;
      }>('/api/v1/users/notification-settings', { method: 'GET' });
      if (remote && typeof remote === 'object') {
        return {
          ...localSettings,
          push: remote.pushEnabled ?? localSettings.push,
          matches: remote.newMatches ?? localSettings.matches,
          messages: remote.newMessages ?? localSettings.messages,
          likes: remote.newLikes ?? localSettings.likes,
          promotions: remote.marketing ?? localSettings.promotions,
        };
      }
    }
  } catch {
    // Keep local settings if offline
  }

  return localSettings;
}

export async function saveNotificationSettings(
  settings: NotificationSettingsMap
): Promise<void> {
  try {
    const serialized = JSON.stringify(settings);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(NOTIFICATION_SETTINGS_FILE, serialized);
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${NOTIFICATION_SETTINGS_FILE}`;
      await FileSystem.writeAsStringAsync(filePath, serialized);
    }
  } catch {
    // Ignore storage write errors silently
  }

  try {
    const token = await authStorage.getToken();
    if (token) {
      await apiRequest('/api/v1/users/notification-settings', {
        method: 'PATCH',
        body: JSON.stringify({
          pushEnabled: Boolean(settings.push),
          newMatches: Boolean(settings.matches),
          newMessages: Boolean(settings.messages),
          newLikes: Boolean(settings.likes),
          marketing: Boolean(settings.promotions),
        }),
      });
    }
  } catch {
    // Ignore network sync failure silently
  }
}

