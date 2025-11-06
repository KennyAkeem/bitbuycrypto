import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedLang, setSelectedLang] = useState(i18n.language || "en");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (e) => {
    const lng = e.target.value;
    setSelectedLang(lng);
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <select
        value={selectedLang}
        onChange={handleChange}
        className="lang-select"
        aria-label="Select language"
      >
        <option value="en">{isMounted ? t("language_en") : "English"}</option>
        <option value="fr">{isMounted ? t("language_fr") : "French"}</option>
        <option value="es">{isMounted ? t("language_es") : "Spanish"}</option>
        <option value="de">{isMounted ? t("language_de") : "German"}</option>
      </select>

      <style jsx>{`
        .language-switcher {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 200px;
        }

        .lang-select {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 0.9rem;
          font-weight: 500;
          outline: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          appearance: none;
          text-align: center;
        }

        .lang-select:hover,
        .lang-select:focus {
          border-color: #00c6ff;
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 640px) {
          .lang-select {
            font-size: 0.85rem;
            padding: 6px 10px;
          }
        }
      `}</style>
    </div>
  );
}
