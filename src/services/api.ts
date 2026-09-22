import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { authStorage } from './authStorage';

export const getBaseUrl = (): string => {
  // 1. Check if user configured an explicit public API URL (e.g. in .env)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // 2. On Web, standard localhost works directly in the browser
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }

  // 3. Dynamic IP detection for physical devices (iOS / Android) via Expo Go / Dev Client
  // hostUri contains the IP of the computer running Metro (e.g. "192.168.1.6:8081")
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000`;
    }
  }

  // 4. Android Emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  // 5. Default fallback
  return 'http://localhost:5000';
};

export const API_BASE_URL = getBaseUrl();

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach auth token if available
  const token = await authStorage.getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Attach dev user ID fallback if available
  const userId = await authStorage.getUserId();
  if (userId) {
    headers.set('x-user-id', userId);
  }

  headers.set('x-client-platform', 'react-native');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let payload: any = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok || payload.success === false) {
    const errorMsg = payload?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return payload.data as T;
}
