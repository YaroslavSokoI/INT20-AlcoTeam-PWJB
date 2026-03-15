import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import uaTranslation from './locales/ua.json';

const resources = {
  en: { translation: enTranslation },
  ua: { translation: uaTranslation },
};

// i18n code (en/ua) → backend lang code (en/uk)
const i18nToBackend: Record<string, string> = { en: 'en', ua: 'uk' };
const backendToI18n: Record<string, string> = { en: 'en', uk: 'ua' };

// Restore saved language or default to ua
const savedBackendLang = localStorage.getItem('quiz-lang');
const lng = savedBackendLang ? (backendToI18n[savedBackendLang] || 'ua') : 'ua';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Ensure localStorage is in sync
localStorage.setItem('quiz-lang', i18nToBackend[lng] || 'uk');

export default i18n;
