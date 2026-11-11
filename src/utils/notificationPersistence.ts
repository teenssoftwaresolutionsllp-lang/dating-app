import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

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
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(NOTIFICATION_SETTINGS_FILE);
        if (raw) {
          return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
        }
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${NOTIFICATION_SETTINGS_FILE}`;
      const info = await FileSystem.getInfoAsync(filePath);
      if (info.exists) {
        const raw = await FileSystem.readAsStringAsync(filePath);
        if (raw) {
          return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
        }
      }
    }
  } catch {
    // Return default settings on failure
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
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
}

