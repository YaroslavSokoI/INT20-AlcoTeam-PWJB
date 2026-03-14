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

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ua', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
  });

export default i18n;
