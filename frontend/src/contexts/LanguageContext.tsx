import React, { useState } from "react";
import { translations } from "../translations";
import {
  Language,
  LanguageContext,
  LanguageContextType,
} from "./languageUtils";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Get user's browser language
  const getBrowserLanguage = (): Language => {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith("zh")) {
      return lang.includes("tw") ? "zh-TW" : "zh-CN";
    }
    return "en";
  };

  const [language, setLanguage] = useState<Language>(getBrowserLanguage());

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value as LanguageContextType}>
      {children}
    </LanguageContext.Provider>
  );
}
