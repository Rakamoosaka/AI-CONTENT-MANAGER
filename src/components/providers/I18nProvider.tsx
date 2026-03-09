"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type Locale,
  toSupportedLocale,
  translate,
} from "@/lib/i18n";

type I18nContextValue = {
  locale: Locale;
  setLocale: (nextLocale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  localeOptions: Array<{ value: Locale; label: string }>;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "ai-content-manager.locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      return toSupportedLocale(stored);
    }

    const browserLocale =
      typeof navigator === "undefined" ? "en" : navigator.language;
    const normalized = browserLocale.slice(0, 2).toLowerCase();
    return toSupportedLocale(normalized);
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: (key, params) => translate(locale, key, params),
      localeOptions: SUPPORTED_LOCALES.map((item) => ({
        value: item,
        label: LOCALE_LABELS[item],
      })),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
