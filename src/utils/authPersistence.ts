import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const AUTH_FILE_NAME = 'user_auth_state.json';

export interface UserAuthState {
  isLoggedIn: boolean;
  isOnboardingCompleted: boolean;
  phoneNumber?: string;
  updatedAt?: number;
}

let inMemoryAuthState: UserAuthState | null = null;
let isLoaded = false;

export async function setUserLoggedIn(
  loggedIn: boolean,
  extra?: Partial<UserAuthState>
): Promise<void> {
  const state: UserAuthState = {
    isLoggedIn: loggedIn,
    isOnboardingCompleted: extra?.isOnboardingCompleted ?? loggedIn,
    phoneNumber: extra?.phoneNumber ?? inMemoryAuthState?.phoneNumber,
    updatedAt: Date.now(),
    ...extra,
  };
  inMemoryAuthState = state;
  isLoaded = true;

  try {
    const serialized = JSON.stringify(state);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(AUTH_FILE_NAME, serialized);
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${AUTH_FILE_NAME}`;
      await FileSystem.writeAsStringAsync(filePath, serialized);
    }
  } catch {
    // Ignore storage write errors silently
  }
}

export function getCachedAuthState(): UserAuthState | null {
  return inMemoryAuthState;
}

export async function getAuthState(): Promise<UserAuthState | null> {
  if (inMemoryAuthState !== null) {
    return inMemoryAuthState;
  }

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(AUTH_FILE_NAME);
        if (raw) {
          inMemoryAuthState = JSON.parse(raw);
          isLoaded = true;
          return inMemoryAuthState;
        }
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${AUTH_FILE_NAME}`;
      const info = await FileSystem.getInfoAsync(filePath);
      if (info.exists) {
        const raw = await FileSystem.readAsStringAsync(filePath);
        if (raw) {
          inMemoryAuthState = JSON.parse(raw);
          isLoaded = true;
          return inMemoryAuthState;
        }
      }
    }
  } catch {
    // Ignore read errors silently
  }

  isLoaded = true;
  return null;
}

export async function isUserLoggedIn(): Promise<boolean> {
  const state = await getAuthState();
  return Boolean(state?.isLoggedIn && state?.isOnboardingCompleted);
}

export async function clearUserAuth(): Promise<void> {
  inMemoryAuthState = { isLoggedIn: false, isOnboardingCompleted: false };
  isLoaded = true;

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(AUTH_FILE_NAME);
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${AUTH_FILE_NAME}`;
      const info = await FileSystem.getInfoAsync(filePath);
      if (info.exists) {
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      }
    }
  } catch {
    // Ignore clear errors silently
  }
}
