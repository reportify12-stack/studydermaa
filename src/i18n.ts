import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import msTranslation from './locales/ms.json';
import enTranslation from './locales/en.json';
import zhTranslation from './locales/zh.json';
import taTranslation from './locales/ta.json';

export const LANGUAGE_STORAGE_KEY = 'study_dermaa_lang';

export const SUPPORTED_LANGUAGES = [
  { code: 'ms', label: 'BM', fullLabel: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'en', label: 'EN', fullLabel: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', fullLabel: '简体中文', flag: '🇨🇳' },
  { code: 'ta', label: 'தமிழ்', fullLabel: 'தமிழ்', flag: '🇮🇳' },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

// Read initial language stored in localStorage or fallback to Bahasa Melayu ('ms')
const savedLanguage = (typeof window !== 'undefined' && localStorage.getItem(LANGUAGE_STORAGE_KEY)) || 'ms';

const resources = {
  ms: msTranslation,
  en: enTranslation,
  zh: zhTranslation,
  ta: taTranslation,
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'ms',
    interpolation: {
      escapeValue: false, // React already safeguards against XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

/**
 * Changes active application language and persists preference in localStorage
 */
export const changeAppLanguage = (languageCode: string): void => {
  i18n.changeLanguage(languageCode);
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  } catch (err) {
    console.error('Failed to save language choice to localStorage:', err);
  }
};

export default i18n;
