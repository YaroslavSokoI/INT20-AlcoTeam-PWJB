import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import uaTranslation from './locales/ua.json';
import ruTranslation from './locales/ru.json';

const resources = {
  en: { translation: enTranslation },
  ua: { translation: uaTranslation },
  ru: { translation: ruTranslation },
};

// i18n code (en/ua/ru) → backend lang code (en/uk/ru)
const i18nToBackend: Record<string, string> = { en: 'en', ua: 'uk', ru: 'ru' };
const backendToI18n: Record<string, string> = { en: 'en', uk: 'ua', ru: 'ru' };

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
