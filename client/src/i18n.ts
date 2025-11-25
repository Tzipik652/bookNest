// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ייבוא קובצי התרגום
import enCommon from './translations/en/common.json';
import heCommon from './translations/he/common.json';

// ייבוא קובצי הבית
import enHome from './translations/en/home.json';
import heHome from './translations/he/home.json';

import enAddBook from './translations/en/addBook.json'
import heAddBook from './translations/he/addBook.json'

import enAdminDashboard from './translations/en/adminDashboard.json'
import heAdminDashboard from './translations/he/adminDashboard.json'

import enAIRecommendations from './translations/en/AIRecommendations.json'
import heAIRecommendations from './translations/he/AIRecommendations.json'

import enBookDetails from './translations/en/bookDetails.json'
import heBookDetails from './translations/he/bookDetails.json'

import enContact from './translations/en/contact.json'
import heContact from './translations/he/contact.json'

import enEditBook from './translations/en/editBook.json'
import heEditBook from './translations/he/editBook.json'

import enFAQ from './translations/en/faq.json'
import heFAQ from './translations/he/faq.json'

import enFavorites from './translations/en/favorites.json'
import heFavorites from './translations/he/favorites.json'

import enAuth from './translations/en/auth.json'
import heAuth from './translations/he/auth.json'

// הגדרת השפה

i18n
  .use(LanguageDetector) // מזהה אוטומטית את שפת המשתמש
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        home: enHome,
        addBook:enAddBook,
        adminDashboard :enAdminDashboard,
        AIRecommendations:enAIRecommendations,
        bookDetails:enBookDetails,
        contact:enContact,
        editBook:enEditBook,
        faq:enFAQ,
        favorites:enFavorites,
        auth:enAuth
      },
      he: {
        common: heCommon,
        home: heHome,
        addBook:heAddBook,
        adminDashboard:heAdminDashboard,
        AIRecommendations:heAIRecommendations,
        bookDetails:heBookDetails,
        contact:heContact,
        editBook:heEditBook,
        faq:heFAQ,
        favorites:heFavorites,
        auth:heAuth
      },
    },
    ns: ['common', 'home','bookDetails','addBook','AIRecommendations','adminDashboard','contact','editBook','faq','favorites','auth'],
    defaultNS: 'common',
    supportedLngs: ['en', 'he'],
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