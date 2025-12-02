import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from "lucide-react";
import { Button } from './ui/button';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'he', label: 'עברית', flag: '🇮🇱' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLanguageChange = (langCode: 'en' | 'he') => {
    i18n.changeLanguage(langCode);
    
    document.body.dir = langCode === 'he' ? 'rtl' : 'ltr';
    
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t("navbar:language")}
      >
        <Globe className="h-4 w-4" />
        <span className="inline-block">
          {languages.find(l => l.code === i18n.language)?.label || 'Language'}
        </span>
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code as 'en' | 'he')}
              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                ${i18n.language === lang.code ? 'text-green-600 font-medium' : 'text-gray-700 dark:text-gray-200'}
              `}
              aria-label={lang.label}
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


export default LanguageSwitcher;
