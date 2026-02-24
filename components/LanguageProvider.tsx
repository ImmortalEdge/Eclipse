'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, TRANSLATIONS, Translations, detectLanguage, getLanguageInfo, isRTL } from '@/lib/i18n';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  isRTL: boolean;
  hasSelectedLanguage: boolean;
  setHasSelectedLanguage: (value: boolean) => void;
}

const LANGUAGE_STORAGE_KEY = 'eclipse_language';
const LANGUAGE_SELECTED_KEY = 'eclipse_language_selected';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load language from localStorage on mount
    const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
    const hasSelected = localStorage.getItem(LANGUAGE_SELECTED_KEY) === 'true';
    
    if (storedLang && TRANSLATIONS[storedLang]) {
      setLanguageState(storedLang);
    } else {
      // Auto-detect on first visit
      const detected = detectLanguage();
      setLanguageState(detected);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, detected);
    }
    
    setHasSelectedLanguage(hasSelected);
    setMounted(true);
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const handleSetHasSelectedLanguage = (value: boolean) => {
    setHasSelectedLanguage(value);
    localStorage.setItem(LANGUAGE_SELECTED_KEY, value.toString());
  };

  const t = TRANSLATIONS[language];
  const rtl = isRTL(language);

  // Provide default context value during initial render to prevent errors
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL: rtl,
    hasSelectedLanguage,
    setHasSelectedLanguage: handleSetHasSelectedLanguage,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      <div dir={rtl ? 'rtl' : 'ltr'} style={{ height: '100%' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
