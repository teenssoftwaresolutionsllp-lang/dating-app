import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import i18n, { type SupportedLanguage } from '@/i18n';
import { getAuthState, setUserLoggedIn } from '@/utils/authPersistence';
import { updateUserLanguage } from '@/utils/api';

const LANGUAGE_STORAGE_KEY = 'app_language';

const SimpleStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
      }
      if (FileSystem.documentDirectory) {
        const path = `${FileSystem.documentDirectory}${key}.txt`;
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists) {
          return await FileSystem.readAsStringAsync(path);
        }
      }
    } catch {}
    return null;
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return;
      }
      if (FileSystem.documentDirectory) {
        const path = `${FileSystem.documentDirectory}${key}.txt`;
        await FileSystem.writeAsStringAsync(path, value);
      }
    } catch {}
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  changeLanguage: (lang: SupportedLanguage, syncBackend?: boolean) => Promise<void>;
  applyUserLanguage: (lang?: string | null) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  changeLanguage: async () => {},
  applyUserLanguage: async () => {},
  isLoading: true,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language from AsyncStorage or authenticated user state
  useEffect(() => {
    let active = true;

    const initLanguage = async () => {
      try {
        const storedLang = await SimpleStorage.getItem(LANGUAGE_STORAGE_KEY);
        const authState = await getAuthState();
        const userLang = authState?.user?.preferredLanguage;

        let targetLang: SupportedLanguage = 'en';

        // If user is logged in and has a preferred language, use it
        if (authState?.isLoggedIn && userLang && (userLang === 'en' || userLang === 'te')) {
          targetLang = userLang;
        } else if (storedLang && (storedLang === 'en' || storedLang === 'te')) {
          targetLang = storedLang as SupportedLanguage;
        }

        if (active) {
          setLanguageState(targetLang);
          await i18n.changeLanguage(targetLang);
        }
      } catch (err) {
        console.warn('Failed to load stored language:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    initLanguage();

    return () => {
      active = false;
    };
  }, []);

  const changeLanguage = async (newLang: SupportedLanguage, syncBackend = true) => {
    try {
      const validLang: SupportedLanguage = newLang === 'te' ? 'te' : 'en';

      // 1. Immediately apply globally in i18next
      await i18n.changeLanguage(validLang);
      setLanguageState(validLang);

      // 2. Persist locally in SimpleStorage
      await SimpleStorage.setItem(LANGUAGE_STORAGE_KEY, validLang);

      // 3. Update auth state if user is logged in
      const authState = await getAuthState();
      if (authState?.user) {
        await setUserLoggedIn(authState.isLoggedIn, {
          user: {
            ...authState.user,
            preferredLanguage: validLang,
          },
        });
      }

      // 4. Save to backend if user is authenticated and syncBackend is true
      if (syncBackend && authState?.isLoggedIn && authState?.accessToken) {
        try {
          await updateUserLanguage(validLang);
        } catch (err) {
          console.warn('Failed to save language to backend:', err);
        }
      }
    } catch (err) {
      console.error('Error changing language:', err);
    }
  };

  const applyUserLanguage = async (userLang?: string | null) => {
    if (userLang && (userLang === 'en' || userLang === 'te')) {
      await changeLanguage(userLang as SupportedLanguage, false);
    }
  };

  const contextValue = useMemo(
    () => ({
      language,
      changeLanguage,
      applyUserLanguage,
      isLoading,
    }),
    [language, isLoading]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

