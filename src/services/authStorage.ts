// In-memory + storage fallback for authentication token and active user ID
let inMemoryToken: string | null = null;
let inMemoryUserId: string | null = null;

export const authStorage = {
  async setToken(token: string) {
    inMemoryToken = token;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('auth_access_token', token);
      }
    } catch {
      // Storage access ignored
    }
  },

  async getToken(): Promise<string | null> {
    if (inMemoryToken) return inMemoryToken;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        inMemoryToken = window.localStorage.getItem('auth_access_token');
      }
    } catch {
      // Storage access ignored
    }
    return inMemoryToken;
  },

  async setUserId(userId: string) {
    inMemoryUserId = userId;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('auth_user_id', userId);
      }
    } catch {
      // Storage access ignored
    }
  },

  async getUserId(): Promise<string | null> {
    if (inMemoryUserId) return inMemoryUserId;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        inMemoryUserId = window.localStorage.getItem('auth_user_id');
      }
    } catch {
      // Storage access ignored
    }
    return inMemoryUserId;
  },

  async clearAuth() {
    inMemoryToken = null;
    inMemoryUserId = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('auth_access_token');
        window.localStorage.removeItem('auth_user_id');
      }
    } catch {
      // Storage access ignored
    }
  },
};
