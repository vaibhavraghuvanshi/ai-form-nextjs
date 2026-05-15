/**
 * Manual mock for react-i18next.
 *
 * - useTranslation: returns t = (key) => key, i18n stub, ready = true
 * - Trans: renders children as-is
 * - I18nextProvider: passthrough wrapper
 * - withTranslation: identity HOC
 * - initReactI18next: passthrough plugin stub
 *
 * Tests that need translated text should pass keys directly; this mock ensures
 * the UI renders predictably without loading real JSON resources.
 */
import React from "react";

const useMock = [(k: string) => k, {}] as const;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(useMock as any).t = (k: string) => k;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(useMock as any).i18n = {
  changeLanguage: jest.fn().mockResolvedValue(undefined),
  language: "en",
  languages: ["en", "ar"],
  isInitialized: true,
  exists: jest.fn(() => true),
  dir: jest.fn(() => "ltr"),
  on: jest.fn(),
  off: jest.fn(),
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(useMock as any).ready = true;

export const useTranslation = jest.fn(() => ({
  t: (key: string, options?: Record<string, unknown>) => {
    if (options?.defaultValue) return String(options.defaultValue);
    return key;
  },
  i18n: {
    changeLanguage: jest.fn().mockResolvedValue(undefined),
    language: "en",
    languages: ["en", "ar"],
    isInitialized: true,
    exists: jest.fn(() => true),
    dir: jest.fn(() => "ltr"),
    on: jest.fn(),
    off: jest.fn(),
  },
  ready: true,
}));

export const Trans = jest.fn(
  ({ children, i18nKey }: { children?: React.ReactNode; i18nKey?: string }) =>
    React.createElement(React.Fragment, null, children ?? i18nKey),
);

export const I18nextProvider = jest.fn(
  ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
);

export const withTranslation =
  () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Component: React.ComponentType<any>) =>
    Component;

export const initReactI18next = {
  type: "3rdParty" as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  init: jest.fn((_i18n: any) => {}),
};

export const useI18n = jest.fn(() => ({ language: "en" }));
