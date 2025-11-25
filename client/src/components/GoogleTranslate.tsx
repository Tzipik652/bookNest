import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from "lucide-react";
import { Button } from './ui/button';

const GoogleTranslate = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'he', label: 'עברית', flag: '🇮🇱' },
  ];

  // ---------------------------
  // 1️⃣ טעינת סקריפט Google Translate
  // ---------------------------
  useEffect(() => {
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.id = "google-translate-script";
      document.body.appendChild(script);
    }

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: "en",
        includedLanguages: languages.map(l => l.code).join(','),
        autoDisplay: false
      }, "google_translate_element");
    };
  }, []);

  // ---------------------------
  // 2️⃣ CSS להסתרת האלמנטים המכוערים
  // ---------------------------
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .goog-te-banner-frame { display: none !important; }
      body { top: 0 !important; position: relative !important; }
      .goog-logo-link, .goog-te-gadget { display: none !important; }
      #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
      .goog-text-highlight { background: none !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);
    return () => {
    document.head.removeChild(style);
  };
  }, []);

  // ---------------------------
  // 3️⃣ החלפת שפה
  // ---------------------------
  const handleLanguageChange = (langCode: 'en' | 'he') => {
    // א. שינוי i18n
    i18n.changeLanguage(langCode);

    // ב. כיוון אתר
    document.body.dir = langCode === 'he' ? 'rtl' : 'ltr';

    // ג. שינוי שפה ב-Google Translate (לכל תוכן דינמי)
    const observer = new MutationObserver(() => {
      const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* אלמנט נסתר ש-Google Translate חייב */}
      <div id="google_translate_element" className="hidden"></div>

      {/* כפתור החלפת שפה */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden md:inline">{languages.find(l => l.code === i18n.language)?.label || 'Language'}</span>
      </Button>

      {/* תפריט נפתח */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() =>handleLanguageChange(lang.code as 'en' | 'he')}
              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                ${i18n.language === lang.code ? 'text-green-600 font-medium' : 'text-gray-700 dark:text-gray-200'}
              `}
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span> {lang.label}
              </span>
              {i18n.language === lang.code && <Check className="h-3 w-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;
