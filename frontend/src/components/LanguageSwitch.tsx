import { useLanguage } from "../contexts/languageUtils";
import type { Language } from "../contexts/languageUtils";

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  const languages: {
    code: Language;
    name: string;
    abbr: string;
    flag: string;
  }[] = [
    { code: "en", name: "English", abbr: "EN", flag: "🇺🇸" },
    { code: "ja", name: "日本語", abbr: "日", flag: "🇯🇵" },
    { code: "zh-TW", name: "繁體中文", abbr: "繁", flag: "🇹🇼" },
    { code: "zh-CN", name: "简体中文", abbr: "简", flag: "🇨🇳" },
  ];

  return (
    <div className="language-switch">
      {languages.map(({ code, name, abbr, flag }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={`language-button ${language === code ? "active" : ""}`}
          title={name}
        >
          <span className="flag">{flag}</span>
          {abbr}
        </button>
      ))}
    </div>
  );
}
