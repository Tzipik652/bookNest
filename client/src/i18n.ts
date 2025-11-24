// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ייבוא קובצי התרגום
import enTranslation from './translations/en.json';
import heTranslation from './translations/he.json';

i18n
  .use(LanguageDetector) // מזהה אוטומטית את שפת המשתמש
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      he: {
        translation: heTranslation
      }
    },
    fallbackLng: 'en', // אם השפה המבוקשת לא קיימת, השתמש באנגלית
    debug: false,
    interpolation: {
      escapeValue: false, // לא צריך לברוח מ-React
    },
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
    }
  });

export default i18n;