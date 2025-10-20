/**
 * Internationalization Configuration
 * Multi-language support for global expansion
 *
 * Supported Languages:
 * - Vietnamese (vi) - Primary
 * - English (en) - Global
 * - Chinese Simplified (zh-CN) - China market
 * - Japanese (ja) - Japan market
 * - Korean (ko) - Korea market
 * - Spanish (es) - Latin America & Spain
 * - French (fr) - France & French-speaking regions
 * - German (de) - Germany
 * - Arabic (ar) - Middle East (RTL support)
 * - Hindi (hi) - India
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

export const SUPPORTED_LANGUAGES = {
  vi: {
    name: 'Tiếng Việt',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    currencySymbol: '₫',
    currencyCode: 'VND',
  },
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    currencySymbol: '$',
    currencyCode: 'USD',
  },
  'zh-CN': {
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    currencySymbol: '¥',
    currencyCode: 'CNY',
  },
  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    currencySymbol: '¥',
    currencyCode: 'JPY',
  },
  ko: {
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr',
    dateFormat: 'YYYY.MM.DD',
    currencySymbol: '₩',
    currencyCode: 'KRW',
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    currencySymbol: '€',
    currencyCode: 'EUR',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    currencySymbol: '€',
    currencyCode: 'EUR',
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    currencySymbol: '€',
    currencyCode: 'EUR',
  },
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    currencySymbol: 'ر.س',
    currencyCode: 'SAR',
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    currencySymbol: '₹',
    currencyCode: 'INR',
  },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Default language fallback chain
export const FALLBACK_LANGUAGES = {
  default: ['en', 'vi'],
  'zh-CN': ['en', 'vi'],
  ja: ['en', 'vi'],
  ko: ['en', 'vi'],
  es: ['en', 'vi'],
  fr: ['en', 'vi'],
  de: ['en', 'vi'],
  ar: ['en', 'vi'],
  hi: ['en', 'vi'],
};

// Initialize i18next
i18n
  .use(Backend) // Load translations using http backend
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n to react-i18next
  .init({
    // Default language
    fallbackLng: FALLBACK_LANGUAGES.default,
    lng: 'vi', // Default to Vietnamese

    // Supported languages
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),

    // Namespace configuration
    ns: [
      'common',
      'auth',
      'courses',
      'workflows',
      'marketplace',
      'admin',
      'payment',
      'profile',
      'errors',
    ],
    defaultNS: 'common',

    // Backend configuration (load translations from /public/locales)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/{{lng}}/{{ns}}.missing.json',
    },

    // Detection order and caches
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
    },

    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes
      formatSeparator: ',',
    },

    // React-specific options
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },

    // Development options
    debug: process.env.NODE_ENV === 'development',

    // Performance
    load: 'languageOnly', // Load 'en' instead of 'en-US'
    cleanCode: true,
    lowerCaseLng: false,

    // Missing keys handling
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} in ${lng}/${ns}`);
      }
    },
  });

export default i18n;
