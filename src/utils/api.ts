import Constants from "expo-constants";
import { Platform } from "react-native";
import { router } from "expo-router";
import { authStorage } from "@/services/authStorage";
import {
  getAccessToken,
  getRefreshToken,
  setUserLoggedIn,
  updateAuthTokens,
} from "./authPersistence";

export const getBaseUrl = (): string => {
  // 1. Explicit environment variable (highest priority)
  if (process.env.EXPO_PUBLIC_API_URL && process.env.EXPO_PUBLIC_API_URL.trim().length > 0) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, "");
  }

  // 2. Explicit app.json extra config
  const extraUrl = Constants.expoConfig?.extra?.apiUrl;
  if (extraUrl && typeof extraUrl === "string" && extraUrl.trim().length > 0) {
    return extraUrl.replace(/\/+$/, "");
  }

  // 3. On Web, standard localhost
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }

  // 4. Dynamic Expo host IP detection (Expo Go development only)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;
  if (hostUri && !hostUri.includes("expo.dev") && !hostUri.includes("exp.host")) {
    const ip = hostUri.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
      return `http://${ip}:5000`;
    }
  }

  // 5. Default physical device fallback
  return "http://192.168.1.24:5000";
};

function extractErrorMessage(errData: any, fallbackMessage: string): string {
  if (!errData) return fallbackMessage;

  if (errData.errors?.fieldErrors) {
    const fieldErrors = errData.errors.fieldErrors;
    const firstKey = Object.keys(fieldErrors)[0];
    if (
      firstKey &&
      Array.isArray(fieldErrors[firstKey]) &&
      fieldErrors[firstKey].length > 0
    ) {
      return fieldErrors[firstKey][0];
    }
  }

  if (
    Array.isArray(errData.errors?.formErrors) &&
    errData.errors.formErrors.length > 0
  ) {
    return errData.errors.formErrors[0];
  }

  if (
    typeof errData.message === "string" &&
    errData.message.trim().length > 0
  ) {
    return errData.message;
  }

  return fallbackMessage;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    "x-client-platform": "react-native",
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const resolvedToken = token || (await getAccessToken());
  if (resolvedToken) {
    headers["Authorization"] = `Bearer ${resolvedToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (fetchErr: any) {
    console.error(`[API Error] Failed to connect to ${url}:`, fetchErr);
    throw new Error(
      `Unable to connect to server at ${url}. (${fetchErr?.message || "Network request failed"})`,
    );
  }

  let json: any;
  try {
    json = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`Server returned error status ${response.status}`);
    }
    return {} as T;
  }

  if (!response.ok || json.success === false) {
    const errorMessage = extractErrorMessage(
      json,
      `Request failed with status ${response.status}`,
    );
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.data = json;
    throw error;
  }

  return json;
}

export interface SendOtpResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    phone: string;
    countryCode: string;
    purpose: string;
    expiresIn: number;
    resendCooldown: number;
    devOtp?: string;
  };
}

export interface VerifyOtpResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    isNewUser: boolean;
    user: any;
    tokens: {
      accessToken: string;
      refreshToken?: string;
      expiresIn?: string;
      refreshExpiresIn?: string;
    };
  };
}

export interface ResendOtpResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    phone: string;
    countryCode: string;
    purpose: string;
    expiresIn: number;
    resendCooldown: number;
    devOtp?: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    tokens: {
      accessToken: string;
      refreshToken?: string;
      expiresIn?: string;
      refreshExpiresIn?: string;
    };
  };
}

export interface LogoutResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

/**
 * POST /api/v1/auth/send-otp
 */
export async function sendOtp(
  phone: string,
  countryCode: string = "+91",
): Promise<SendOtpResponse> {
  const cleanedPhone = phone.replace(/\D/g, "");
  return apiRequest<SendOtpResponse>("/api/v1/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone: cleanedPhone, countryCode }),
  });
}

/**
 * POST /api/v1/auth/resend-otp
 */
export async function resendOtp(
  phone: string,
  countryCode: string = "+91",
): Promise<ResendOtpResponse> {
  const cleanedPhone = phone.replace(/\D/g, "");
  return apiRequest<ResendOtpResponse>("/api/v1/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ phone: cleanedPhone, countryCode }),
  });
}

/**
 * POST /api/v1/auth/verify-otp
 */
export async function verifyOtp(
  phone: string,
  otp: string,
  countryCode: string = "+91",
): Promise<VerifyOtpResponse> {
  const cleanedPhone = phone.replace(/\D/g, "");
  const cleanedOtp = otp.trim();

  const response = await apiRequest<VerifyOtpResponse>(
    "/api/v1/auth/verify-otp",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-platform": "react-native",
      },
      body: JSON.stringify({
        phone: cleanedPhone,
        countryCode,
        otp: cleanedOtp,
      }),
    },
  );

  const tokens = response.data?.tokens;
  if (tokens?.accessToken) {
    await setUserLoggedIn(true, {
      phoneNumber: cleanedPhone,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: response.data?.user,
      isOnboardingCompleted: !response.data?.isNewUser,
    });
  }

  return response;
}

/**
 * POST /api/v1/auth/refresh-token
 */
export async function refreshToken(): Promise<string> {
  const storedRefreshToken = await getRefreshToken();
  if (!storedRefreshToken) {
    await authStorage.clearAuth();
    router.replace("/login" as any);
    throw new Error("No refresh token available");
  }

  try {
    const response = await apiRequest<RefreshTokenResponse>(
      "/api/v1/auth/refresh-token",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      },
    );

    const tokens = response.data?.tokens;
    if (!tokens?.accessToken) {
      throw new Error("Invalid token refresh response");
    }

    await updateAuthTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || storedRefreshToken,
    });

    return tokens.accessToken;
  } catch (error: any) {
    await authStorage.clearAuth();
    router.replace("/login" as any);
    throw error;
  }
}

/**
 * POST /api/v1/auth/logout
 */
export async function logout(): Promise<void> {
  const storedRefreshToken = await getRefreshToken();
  const storedAccessToken = await getAccessToken();

  try {
    await apiRequest<LogoutResponse>(
      "/api/v1/auth/logout",
      {
        method: "POST",
        body: JSON.stringify({
          refreshToken: storedRefreshToken || "",
        }),
      },
      storedAccessToken,
    );
  } catch {
    // Network or server error on logout - continue to clear local auth
  } finally {
    await authStorage.clearAuth();
  }
}
