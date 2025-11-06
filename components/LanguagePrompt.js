import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Hydration-safe language prompt that runs only on client
export default function LanguagePrompt() {
  const { t, i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [detectedLang, setDetectedLang] = useState(null);

  // supported languages (keep in sync with i18n.js)
  const supported = ['en', 'fr', 'es', 'de'];

  useEffect(() => {
    setIsMounted(true);
    // run this only in browser
    if (typeof window === 'undefined') return;

    // already chosen by i18n or cached?
    const current = i18n.language || (window.localStorage && window.localStorage.getItem('i18nextLng')) || null;

    // If user already set a language explicitly, don't prompt
    // Also don't prompt if current already equals detected
    const nav = navigator.languages && navigator.languages.length ? navigator.languages[0] : (navigator.language || navigator.userLanguage || '');
    const browserLang = nav ? String(nav).split('-')[0] : null;

    // if browserLang not in supported, bail
    if (!browserLang || supported.indexOf(browserLang) === -1) return;

    // Do not prompt if current language already equals browserLang
    if (current && current.split && current.split('-')[0] === browserLang) return;

    // Do not prompt if user dismissed for this language
    try {
      const dismissed = window.localStorage.getItem('langPromptDismissed');
      if (dismissed === browserLang) return;
    } catch (e) {
      // ignore localStorage errors
    }

    // else show prompt offering to switch to browserLang
    setDetectedLang(browserLang);
    setShowPrompt(true);
  }, [i18n.language]);

  if (!isMounted) return null; // avoid server-render mismatch

  if (!showPrompt || !detectedLang) return null;

  // mapping of language code -> readable name (this will be translated by t())
  const langKey = {
    en: 'language_en',
    fr: 'language_fr',
    es: 'language_es',
    de: 'language_de'
  }[detectedLang] || detectedLang;

  const handleAccept = () => {
    i18n.changeLanguage(detectedLang);
    setShowPrompt(false);
    // i18next will cache the selection according to your i18n config
  };

  const handleDecline = () => {
    try {
      window.localStorage.setItem('langPromptDismissed', detectedLang);
    } catch (e) {
      // ignore
    }
    setShowPrompt(false);
  };

  // Simple banner styles, non-blocking fixed at bottom right
  return (
    <div style={{
      position: 'fixed',
      right: '16px',
      bottom: '16px',
      zIndex: 9999,
      background: 'rgba(15,23,42,0.95)',
      color: '#fff',
      padding: '12px 14px',
      borderRadius: '10px',
      boxShadow: '0 6px 20px rgba(2,6,23,0.4)',
      maxWidth: '320px',
      fontSize: '14px',
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          {/* Example: "Detected language: Spanish" */}
          {t('change_language')}
        </div>
        <div style={{ opacity: 0.95 }}>
          {/* e.g. "We detected Spanish. Switch to Español?" */}
          {t('welcome') /* small filler so t is used -- optional */}
          <div style={{ marginTop: 6 }}>
            { /* Show message in current UI language, with detected language name */}
            {t('change_language')}: {t(langKey)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          onClick={handleAccept}
          style={{
            background: 'linear-gradient(90deg,#2359f7,#00b4d8)',
            color: '#fff',
            border: 'none',
            padding: '6px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {t('language_en') ? t('language_en') /* ensure t is available */ : 'OK'}
        </button>
        <button
          onClick={handleDecline}
          style={{
            background: 'transparent',
            color: '#cbd5e1',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '6px 8px',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          {t('logout') ? t('logout') : 'No'} {/* reuse existing keys to avoid new ones */}
        </button>
      </div>
    </div>
  );
}