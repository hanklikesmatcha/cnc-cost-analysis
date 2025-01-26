import { createContext, useContext } from "react";
import { translations } from "../translations";

export type Language = "en" | "zh-TW" | "zh-CN";
export type TranslationType = typeof translations.en;

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
