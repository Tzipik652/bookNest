// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './translations/en/common.json';
import heCommon from './translations/he/common.json';

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

import enMyBooksPage from './translations/en/myBooksPage.json'
import heMyBooksPage from './translations/he/myBooksPage.json'

import enPolicy from './translations/en/policy.json'
import hePolicy from './translations/he/policy.json'

import enTerms from './translations/en/terms.json'
import heTerms from './translations/he/terms.json'

import enAccessibility from './translations/en/accessibility.json'
import heAccessibility from './translations/he/accessibility.json'

import enBookCard from './translations/en/bookCard.json'
import heBookCard from './translations/he/bookCard.json'

import enComments from './translations/en/comments.json'
import heComments from './translations/he/comments.json'

import enFooter from './translations/en/footer.json'
import heFooter from './translations/he/footer.json'

import enKeyboardShortcutsHelp from './translations/en/keyboardShortcutsHelp.json'
import heKeyboardShortcutsHelp from './translations/he/keyboardShortcutsHelp.json'

import enWelcomeToast from './translations/en/welcomeToast.json'
import heWelcomeToast from './translations/he/welcomeToast.json'

import enLanding from './translations/en/landing.json'
import heLanding from './translations/he/landing.json'

import enNavbar from './translations/en/navbar.json'
import heNavbar from './translations/he/navbar.json'

i18n
  .use(LanguageDetector)
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
        auth:enAuth,
        myBooksPage:enMyBooksPage,
        policy:enPolicy,
        terms:enTerms,
        accessibility:enAccessibility,
        bookCard:enBookCard,
        comments:enComments,
        footer:enFooter,
        keyboardShortcutsHelp:enKeyboardShortcutsHelp,
        welcomeToast:enWelcomeToast,
        landing:enLanding,
        navbar:enNavbar
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
        auth:heAuth,
        myBooksPage:heMyBooksPage,
        policy:hePolicy,
        terms:heTerms,
        accessibility:heAccessibility,
        bookCard:heBookCard,
        comments:heComments,
        footer:heFooter,
        keyboardShortcutsHelp:heKeyboardShortcutsHelp,
        welcomeToast:heWelcomeToast,
        landing:heLanding,
        navbar:heNavbar
      },
    },
    ns: ['common', 'home','bookDetails','addBook','AIRecommendations','adminDashboard','contact','editBook','faq','favorites','auth','myBooksPage','policy','terms','accessibility','bookCard','comments','footer','keyboardShortcutsHelp','welcomeToast','landing','navbar'],
    defaultNS: 'common',
    supportedLngs: ['en', 'he'],
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
    }
  });

export default i18n;