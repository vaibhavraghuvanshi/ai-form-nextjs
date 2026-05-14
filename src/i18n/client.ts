"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./resources/en.json";
import ar from "./resources/ar.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export function setDocumentLanguage(lng: string) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
}

export default i18n;
