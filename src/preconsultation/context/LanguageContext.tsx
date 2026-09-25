import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { LanguageOption } from "../types";
import { SUPPORTED_LANGUAGES } from "../data/languages";
import {
  FullLanguageTranslation,
  getFullTranslation,
  t as translateKey,
  resolveLanguageCode,
  runLanguageCoverageReport,
} from "../i18n";

export interface LanguageContextType {
  selectedLanguage: string; // e.g. "Tamil"
  selectedLocale: string; // e.g. "ta-IN"
  selectedVoiceLocale: string; // e.g. "ta-IN"
  languageOption: LanguageOption;
  setLanguage: (lang: LanguageOption | string) => void;
  translate: (key: string, fallback?: string) => string;
  t: (key: string, fallback?: string) => string;
  getVoiceLocale: () => string;
  fullTranslation: FullLanguageTranslation;
  allLanguages: LanguageOption[];
}

const STORAGE_KEY_LANG = "caseline_selected_lang";
const STORAGE_KEY_LOCALE = "caseline_selected_locale";
const STORAGE_KEY_VOICE_LOCALE = "caseline_selected_voice_locale";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function findLanguageOption(identifier: string): LanguageOption | undefined {
  const clean = identifier.trim().toLowerCase();
  return SUPPORTED_LANGUAGES.find(
    (l) =>
      l.name.toLowerCase() === clean ||
      l.code.toLowerCase() === clean ||
      l.locale.toLowerCase() === clean
  );
}

function getInitialLanguage(): LanguageOption {
  try {
    // 1. Check localStorage for caseline_selected_lang
    const storedLang =
      localStorage.getItem(STORAGE_KEY_LANG) ||
      sessionStorage.getItem(STORAGE_KEY_LANG);

    if (storedLang) {
      try {
        const parsed = JSON.parse(storedLang);
        if (parsed && typeof parsed === "object" && parsed.code) {
          const match = SUPPORTED_LANGUAGES.find((l) => l.code === parsed.code);
          if (match) return match;
        }
      } catch (e) {
        const match = findLanguageOption(storedLang);
        if (match) return match;
      }
    }

    // 2. Check stored locale if language string was absent
    const storedLocale =
      localStorage.getItem(STORAGE_KEY_LOCALE) ||
      sessionStorage.getItem(STORAGE_KEY_LOCALE);
    if (storedLocale) {
      const match = SUPPORTED_LANGUAGES.find((l) => l.locale === storedLocale);
      if (match) return match;
    }
  } catch (err) {
    console.warn("Could not read language preferences from storage:", err);
  }

  // English fallback only before user selects
  return SUPPORTED_LANGUAGES[0];
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<LanguageOption>(getInitialLanguage);

  // Sync to localStorage and sessionStorage whenever currentLang changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, JSON.stringify(currentLang));
      localStorage.setItem(STORAGE_KEY_LOCALE, currentLang.locale);
      localStorage.setItem(STORAGE_KEY_VOICE_LOCALE, currentLang.ttsLang);

      sessionStorage.setItem(STORAGE_KEY_LANG, JSON.stringify(currentLang));
      sessionStorage.setItem(STORAGE_KEY_LOCALE, currentLang.locale);
      sessionStorage.setItem(STORAGE_KEY_VOICE_LOCALE, currentLang.ttsLang);

      // Also set document html lang
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.lang = currentLang.code;
      }
    } catch (e) {
      console.warn("Failed to persist language preferences:", e);
    }
  }, [currentLang]);

  const setLanguage = useCallback((lang: LanguageOption | string) => {
    let resolved: LanguageOption | undefined;
    if (typeof lang === "string") {
      resolved = findLanguageOption(lang);
    } else if (lang && typeof lang === "object") {
      resolved = SUPPORTED_LANGUAGES.find((l) => l.code === lang.code) || lang;
    }

    if (resolved) {
      setCurrentLang(resolved);
    } else {
      console.warn(`Could not resolve language for:`, lang);
    }
  }, []);

  const fullTranslation = useMemo(() => {
    return getFullTranslation(currentLang.code);
  }, [currentLang.code]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      return translateKey(key, currentLang.code, fallback);
    },
    [currentLang.code]
  );

  const getVoiceLocale = useCallback((): string => {
    return currentLang.ttsLang || currentLang.locale || "en-IN";
  }, [currentLang]);

  const contextValue = useMemo<LanguageContextType>(() => {
    return {
      selectedLanguage: currentLang.name,
      selectedLocale: currentLang.locale,
      selectedVoiceLocale: currentLang.ttsLang || currentLang.locale,
      languageOption: currentLang,
      setLanguage,
      translate: t,
      t,
      getVoiceLocale,
      fullTranslation,
      allLanguages: SUPPORTED_LANGUAGES,
    };
  }, [currentLang, setLanguage, t, getVoiceLocale, fullTranslation]);

  // Run dev-time coverage report once
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      try {
        const report = runLanguageCoverageReport();
        console.info(
          `[i18n] Language coverage validation initialized. Total keys: ${report.totalKeys}`
        );
      } catch (err) {
        console.warn("[i18n] Coverage check error:", err);
      }
    }
  }, []);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
