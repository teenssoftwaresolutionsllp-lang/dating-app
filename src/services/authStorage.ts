import {
  getAccessToken,
  getAuthState,
  setUserLoggedIn,
  updateAuthTokens,
  clearUserAuth,
} from '@/utils/authPersistence';

let inMemoryToken: string | null = null;
let inMemoryUserId: string | null = null;

export const authStorage = {
  async setToken(token: string) {
    inMemoryToken = token;
    await setUserLoggedIn(true, { accessToken: token });
  },

  async getToken(): Promise<string | null> {
    if (inMemoryToken) return inMemoryToken;
    const token = await getAccessToken();
    if (token) {
      inMemoryToken = token;
      return token;
    }
    return null;
  },

  async setUserId(userId: string) {
    inMemoryUserId = userId;
    const state = await getAuthState();
    await setUserLoggedIn(true, {
      user: { ...(state?.user || {}), id: userId },
    });
  },

  async getUserId(): Promise<string | null> {
    if (inMemoryUserId) return inMemoryUserId;
    const state = await getAuthState();
    const userId = state?.user?.id || state?.user?.userId || null;
    if (userId) {
      inMemoryUserId = userId;
      return userId;
    }
    return null;
  },

  async getRefreshToken(): Promise<string | null> {
    const state = await getAuthState();
    return state?.refreshToken || null;
  },

  async setTokens(accessToken: string, refreshToken?: string) {
    inMemoryToken = accessToken;
    const state = (await getAuthState()) || {
      isLoggedIn: true,
      isOnboardingCompleted: false,
    };
    await updateAuthTokens({ accessToken, refreshToken: refreshToken ?? state.refreshToken });
  },

  async clearAuth() {
    inMemoryToken = null;
    inMemoryUserId = null;
    await clearUserAuth();
  },
};

