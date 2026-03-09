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
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isLocaleReady, setIsLocaleReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      setLocaleState(toSupportedLocale(stored));
      setIsLocaleReady(true);
      return;
    }

    const normalized = navigator.language.slice(0, 2).toLowerCase();
    setLocaleState(toSupportedLocale(normalized));
    setIsLocaleReady(true);
  }, []);

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

  if (!isLocaleReady) {
    return (
      <div
        className="min-h-screen bg-(--bg-base) p-4 md:p-6"
        aria-hidden="true"
      >
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[15.5rem_1fr]">
          <aside className="glass-card accent-panel rounded-3xl p-4">
            <div className="h-8 w-2/3 rounded-lg bg-(--bg-soft) ai-pulse" />
            <div className="mt-3 h-4 w-5/6 rounded bg-(--bg-soft)/90 ai-pulse" />
            <div className="mt-8 space-y-2">
              <div className="h-10 rounded-xl bg-(--bg-soft)/85 ai-pulse" />
              <div className="h-10 rounded-xl bg-(--bg-soft)/85 ai-pulse" />
              <div className="h-10 rounded-xl bg-(--bg-soft)/85 ai-pulse" />
            </div>
          </aside>
          <div className="space-y-4">
            <div className="glass-card accent-panel rounded-3xl p-5">
              <div className="h-4 w-28 rounded bg-(--bg-soft)/90 ai-pulse" />
              <div className="mt-3 h-7 w-2/3 rounded-lg bg-(--bg-soft) ai-pulse" />
              <div className="mt-2 h-4 w-4/5 rounded bg-(--bg-soft)/80 ai-pulse" />
            </div>
            <div className="glass-card rounded-3xl p-5">
              <div className="space-y-3">
                <div className="h-11 rounded-xl bg-(--bg-soft)/85 ai-pulse" />
                <div className="h-11 rounded-xl bg-(--bg-soft)/85 ai-pulse" />
                <div className="h-11 rounded-xl bg-(--bg-soft)/85 ai-pulse" />
                <div className="h-44 rounded-2xl bg-(--bg-soft)/80 ai-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
