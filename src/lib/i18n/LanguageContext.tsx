"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, TranslationDictionary } from "./index";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (!active) return;
      try {
        const saved = localStorage.getItem("everlight_lang") as Language | null;
        if (saved === "am" || saved === "en") {
          setLanguageState(saved);
        }
      } catch {
        // ignore localStorage errors
      }
      setMounted(true);
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("everlight_lang", lang);
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "am" : "en");
  };

  const t: TranslationDictionary = (translations[language] || translations.en) as TranslationDictionary;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {/* Set amharic font smoothing if needed */}
      <div className={mounted && language === "am" ? "lang-amharic" : ""}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback outside provider
    return {
      language: "en" as Language,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: translations.en as TranslationDictionary,
    };
  }
  return context;
}
