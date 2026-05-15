/**
 * Mock for @/components/providers/AppProviders
 *
 * - AppProviders: renders children directly (no i18n/context overhead)
 * - useLanguage: returns a controllable language context stub
 *
 * Override per-test:
 *   import { useLanguage } from '@/components/providers/AppProviders';
 *   (useLanguage as jest.Mock).mockReturnValue({ language: 'ar', setLanguage: jest.fn() });
 */
import React from "react";

export const useLanguage = jest.fn(() => ({
  language: "en" as "en" | "ar",
  setLanguage: jest.fn(),
}));

export const AppProviders = jest.fn(
  ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
);
