import { useLanguage } from "../contexts/languageUtils";

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="language-switch">
      <button
        onClick={() => setLanguage("en")}
        className={`language-button ${language === "en" ? "active" : ""}`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("zh-TW")}
        className={`language-button ${language === "zh-TW" ? "active" : ""}`}
      >
        繁
      </button>
      <button
        onClick={() => setLanguage("zh-CN")}
        className={`language-button ${language === "zh-CN" ? "active" : ""}`}
      >
        简
      </button>
    </div>
  );
}
