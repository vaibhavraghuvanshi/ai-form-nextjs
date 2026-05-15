/**
 * Mock for @/i18n/client
 *
 * Provides a minimal i18n instance that:
 *  - returns the translation key as-is (no resource loading needed)
 *  - exposes changeLanguage / isInitialized so components do not crash
 *
 * Usage in tests:
 *   jest.mock('@/i18n/client');
 *   // useTranslation() will return t = (key) => key
 */

const i18nMock = {
  isInitialized: true,
  language: "en",
  languages: ["en", "ar"],
  use: jest.fn().mockReturnThis(),
  init: jest.fn().mockResolvedValue(undefined),
  changeLanguage: jest.fn().mockResolvedValue(undefined),
  t: jest.fn((key: string) => key),
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  exists: jest.fn(() => true),
  getFixedT: jest.fn(() => (key: string) => key),
  setDefaultNamespace: jest.fn(),
  dir: jest.fn(() => "ltr"),
  format: jest.fn((value: unknown) => String(value)),
  store: { data: {} },
  options: {},
  services: {
    interpolator: {
      interpolate: jest.fn((str: string) => str),
    },
    resourceStore: {
      data: {},
    },
  },
};

export function setDocumentLanguage(_lng: string): void {
  // no-op in tests
}

export default i18nMock;
