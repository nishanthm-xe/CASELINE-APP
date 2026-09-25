import { FullLanguageTranslation, SupportedLanguageCode } from "./types";
import { en } from "./locales/en";
import { hi } from "./locales/hi";
import { ta } from "./locales/ta";
import { te } from "./locales/te";
import { kn } from "./locales/kn";
import { ml } from "./locales/ml";
import { bn } from "./locales/bn";
import { mr } from "./locales/mr";
import { gu } from "./locales/gu";
import { pa } from "./locales/pa";
import { or } from "./locales/or";
import { as } from "./locales/as";
import { ur } from "./locales/ur";
import { LanguageOption } from "../types";

export * from "./types";

export const ALL_LOCALES: Record<SupportedLanguageCode, FullLanguageTranslation> = {
  en,
  hi,
  ta,
  te,
  kn,
  ml,
  bn,
  mr,
  gu,
  pa,
  or,
  as,
  ur,
};

export const LANGUAGE_NAME_TO_CODE: Record<string, SupportedLanguageCode> = {
  English: "en",
  Hindi: "hi",
  Tamil: "ta",
  Telugu: "te",
  Kannada: "kn",
  Malayalam: "ml",
  Bengali: "bn",
  Marathi: "mr",
  Gujarati: "gu",
  Punjabi: "pa",
  Odia: "or",
  Assamese: "as",
  Urdu: "ur",
};

export function resolveLanguageCode(langOrCode?: string): SupportedLanguageCode {
  if (!langOrCode) return "en";
  const lower = langOrCode.toLowerCase().trim();
  if (lower in ALL_LOCALES) {
    return lower as SupportedLanguageCode;
  }
  for (const [name, code] of Object.entries(LANGUAGE_NAME_TO_CODE)) {
    if (name.toLowerCase() === lower) {
      return code;
    }
  }
  return "en";
}

export function getFullTranslation(langOrCode?: string): FullLanguageTranslation {
  const code = resolveLanguageCode(langOrCode);
  return ALL_LOCALES[code] || ALL_LOCALES.en;
}

/**
 * Access nested translation key using dot notation (e.g., 'common.continue', 'interview.listening')
 */
export function t(key: string, langOrCode?: string, fallback?: string): string {
  const translation = getFullTranslation(langOrCode);
  const parts = key.split(".");
  
  let current: any = translation;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
  }

  if (typeof current === "string") {
    return current;
  }

  // Fallback to English if translation is missing in the chosen language
  if (translation.code !== "en") {
    let enCurrent: any = ALL_LOCALES.en;
    for (const part of parts) {
      if (enCurrent && typeof enCurrent === "object" && part in enCurrent) {
        enCurrent = enCurrent[part];
      } else {
        enCurrent = undefined;
        break;
      }
    }
    if (typeof enCurrent === "string") {
      return enCurrent;
    }
  }

  return fallback || key;
}

/**
 * Coverage checker that compares every locale against English baseline
 */
export interface TranslationCoverageReport {
  totalKeys: number;
  results: Record<
    SupportedLanguageCode,
    {
      locale: string;
      name: string;
      covered: number;
      missingKeys: string[];
      coveragePercent: number;
    }
  >;
}

export function runLanguageCoverageReport(): TranslationCoverageReport {
  const enLocale = ALL_LOCALES.en;

  function extractKeys(obj: any, prefix = ""): string[] {
    let keys: string[] = [];
    for (const k of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
        keys = keys.concat(extractKeys(obj[k], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  }

  const allKeys = extractKeys(enLocale);
  const results: any = {};

  for (const [code, localeObj] of Object.entries(ALL_LOCALES)) {
    const missing: string[] = [];
    let covered = 0;

    for (const key of allKeys) {
      const parts = key.split(".");
      let val: any = localeObj;
      for (const p of parts) {
        val = val?.[p];
      }
      if (val !== undefined && val !== null && val !== "") {
        covered++;
      } else {
        missing.push(key);
      }
    }

    results[code] = {
      locale: localeObj.locale,
      name: localeObj.name,
      covered,
      missingKeys: missing,
      coveragePercent: Math.round((covered / allKeys.length) * 100),
    };
  }

  return {
    totalKeys: allKeys.length,
    results,
  };
}
