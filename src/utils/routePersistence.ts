import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const ROUTE_FILE_NAME = 'last_active_route.txt';
let inMemoryActiveRoute: string | null = null;

export async function setLastActiveRoute(route: string): Promise<void> {
  inMemoryActiveRoute = route;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(ROUTE_FILE_NAME, route);
      }
    } else if (FileSystem.documentDirectory) {
      await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}${ROUTE_FILE_NAME}`,
        route
      );
    }
  } catch {
    // Ignore storage errors
  }
}

export function getCachedLastActiveRoute(): string | null {
  return inMemoryActiveRoute;
}

export async function getLastActiveRoute(): Promise<string | null> {
  if (inMemoryActiveRoute) {
    return inMemoryActiveRoute;
  }
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const route = window.sessionStorage.getItem(ROUTE_FILE_NAME);
        inMemoryActiveRoute = route;
        return route;
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${ROUTE_FILE_NAME}`;
      const info = await FileSystem.getInfoAsync(filePath);
      if (info.exists) {
        const route = await FileSystem.readAsStringAsync(filePath);
        inMemoryActiveRoute = route;
        return route;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

export async function clearLastActiveRoute(): Promise<void> {
  inMemoryActiveRoute = null;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(ROUTE_FILE_NAME);
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${ROUTE_FILE_NAME}`;
      const info = await FileSystem.getInfoAsync(filePath);
      if (info.exists) {
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      }
    }
  } catch {
    // Ignore storage errors
  }
}

const PENDING_ACTION_FILE_NAME = 'pending_verification_action.txt';

export async function setPendingVerificationAction(
  action: 'govId_upload' | 'govId_camera' | 'selfie'
): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(PENDING_ACTION_FILE_NAME, action);
      }
    } else if (FileSystem.documentDirectory) {
      await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}${PENDING_ACTION_FILE_NAME}`,
        action
      );
    }
  } catch {
    // Ignore storage errors
  }
}

export async function getPendingVerificationAction(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(PENDING_ACTION_FILE_NAME);
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${PENDING_ACTION_FILE_NAME}`;
      const info = await FileSystem.getInfoAsync(filePath);
      if (info.exists) {
        return await FileSystem.readAsStringAsync(filePath);
      }
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

export async function clearPendingVerificationAction(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(PENDING_ACTION_FILE_NAME);
      }
    } else if (FileSystem.documentDirectory) {
      const filePath = `${FileSystem.documentDirectory}${PENDING_ACTION_FILE_NAME}`;
      const info = await FileSystem.getInfoAsync(filePath);
      if (info.exists) {
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      }
    }
  } catch {
    // Ignore storage errors
  }
}

