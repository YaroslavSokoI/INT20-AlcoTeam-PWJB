import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import uaTranslation from './locales/ua.json';

const resources = {
  en: { translation: enTranslation },
  ua: { translation: uaTranslation },
};

// Restore saved language or default to ua
const savedLang = localStorage.getItem('quiz-lang');
const lng = savedLang && ['en', 'ua'].includes(savedLang) ? savedLang : 'ua';

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
localStorage.setItem('quiz-lang', lng);

export default i18n;
