"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { setDocumentLanguage } from "@/i18n/client";

const LANG_STORAGE_KEY = "social-support-preferred-lang";

type Lang = "en" | "ar";

type LanguageContextValue = {
  language: Lang;
  setLanguage: (lng: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (stored === "ar" || stored === "en") {
        setLanguageState(stored);
        void i18n.changeLanguage(stored);
        setDocumentLanguage(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    setDocumentLanguage("en");
  }, []);

  const setLanguage = useCallback((lng: Lang) => {
    setLanguageState(lng);
    void i18n.changeLanguage(lng);
    setDocumentLanguage(lng);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lng);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
    </I18nextProvider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within AppProviders");
  }
  return ctx;
}
