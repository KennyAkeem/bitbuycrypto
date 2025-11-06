import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// NOTE: this file runs both on server and client during Next rendering.
// Language detection (navigator etc.) only runs in the browser, but
// configuring detection options here lets the browser pick and cache the user's choice.

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'fr', 'es', 'de'],
    fallbackLng: 'en',
    // prefer language-only codes (so "es-ES" maps to "es")
    load: 'languageOnly',
    ns: ['common'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    detection: {
      // where to look first (querystring, then saved preference, then browser)
      order: ['querystring', 'localStorage', 'cookie', 'navigator', 'htmlTag'],
      // keys to look for in localStorage / cookie (uses same key as i18next)
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18next',
      // where to cache user language (so next visits remember)
      caches: ['localStorage', 'cookie'],
      // when language is 'es-ES' only keep 'es' (languageOnly above also helps)
      checkWhitelist: true
    },
    react: { useSuspense: false }
  });

export default i18n;