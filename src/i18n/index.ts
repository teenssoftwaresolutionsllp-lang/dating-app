import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { te } from './locales/te';

export const resources = {
  en: { translation: en },
  te: { translation: te },
} as const;

export type SupportedLanguage = 'en' | 'te';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4' as any,
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  } as any);
}

export default i18n;

