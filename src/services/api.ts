import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { authStorage } from './authStorage';

export const getBaseUrl = (): string => {
  // 1. On Web, standard localhost works directly in the browser
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }

  // 2. Dynamic IP detection for physical devices (iOS / Android) via Expo Go / Dev Client
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

  // 3. Explicit EXPO_PUBLIC_API_URL fallback
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // 4. Android Emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  // 5. Default fallback
  return 'http://localhost:5000';
};

export const API_BASE_URL = getBaseUrl();

export const formatApiImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('file:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const base = getBaseUrl();
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

let refreshTokenPromise: Promise<string | null> | null = null;

/**
 * Deduplicated token refresher that requests a fresh access token using the stored refresh token.
 */
async function tryRefreshToken(): Promise<string | null> {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    try {
      const refreshToken = await authStorage.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-platform': 'react-native',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const newTokens = data?.data?.tokens || data?.tokens;
      if (newTokens?.accessToken) {
        await authStorage.setTokens(newTokens.accessToken, newTokens.refreshToken);
        return newTokens.accessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
}

export async function uploadFormData<T>(
  path: string,
  formData: FormData,
  isRetry = false,
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const token = await authStorage.getToken();
  const userId = await authStorage.getUserId();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    if (userId) {
      xhr.setRequestHeader('x-user-id', userId);
    }
    xhr.setRequestHeader('x-client-platform', 'react-native');

    xhr.onload = async () => {
      let payload: any = {};
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        payload = {};
      }

      // Check if access token expired and can be refreshed
      const isAuthError =
        xhr.status === 401 ||
        (payload?.message &&
          payload.message.toLowerCase().includes('token') &&
          payload.message.toLowerCase().includes('expire'));

      if (isAuthError && !isRetry) {
        const refreshedToken = await tryRefreshToken();
        if (refreshedToken) {
          try {
            const retryResult = await uploadFormData<T>(path, formData, true);
            resolve(retryResult);
            return;
          } catch (retryErr) {
            reject(retryErr);
            return;
          }
        }
      }

      if (xhr.status >= 200 && xhr.status < 300 && payload.success !== false) {
        resolve((payload.data ?? payload) as T);
      } else {
        const errorMsg =
          payload?.message || `Upload failed with status ${xhr.status}`;
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network request failed during file upload. Please check your connection.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload timed out. Please try again.'));
    };

    xhr.timeout = 60000;
    xhr.send(formData);
  });
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const isFormData =
    options.body instanceof FormData ||
    (Boolean(options.body) && typeof (options.body as any).append === 'function') ||
    (options.body as any)?.constructor?.name === 'FormData';

  if (isFormData && options.body instanceof FormData) {
    return uploadFormData<T>(path, options.body);
  }

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-client-platform': 'react-native',
  };

  // Copy any custom options headers
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((val, key) => {
        requestHeaders[key] = val;
      });
    } else if (typeof options.headers === 'object') {
      for (const [k, v] of Object.entries(options.headers)) {
        requestHeaders[k] = String(v);
      }
    }
  }

  // Attach auth token if available
  const token = await authStorage.getToken();
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Attach dev user ID fallback if available
  const userId = await authStorage.getUserId();
  if (userId) {
    requestHeaders['x-user-id'] = userId;
  }

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    headers: requestHeaders,
  });

  let payload: any = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  // If token expired, attempt automatic refresh & transparent retry once
  const isAuthError =
    response.status === 401 ||
    (payload?.message &&
      payload.message.toLowerCase().includes('token') &&
      payload.message.toLowerCase().includes('expire'));

  if (isAuthError && !isRetry) {
    const refreshedToken = await tryRefreshToken();
    if (refreshedToken) {
      return apiRequest<T>(path, options, true);
    }
  }

  if (!response.ok || payload.success === false) {
    const errorMsg = payload?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return payload.data as T;
}
