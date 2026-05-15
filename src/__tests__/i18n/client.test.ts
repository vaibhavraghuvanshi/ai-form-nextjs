/**
 * Tests for src/i18n/client.ts
 */

describe("i18n/client – setDocumentLanguage", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { setDocumentLanguage } = require("@/i18n/client") as typeof import("@/i18n/client");

  it("sets lang and ltr for English", () => {
    setDocumentLanguage("en");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("sets lang and rtl for Arabic", () => {
    setDocumentLanguage("ar");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("returns early when document is undefined (SSR guard)", () => {
    const orig = global.document;
    // @ts-expect-error – simulate SSR environment
    delete global.document;
    expect(() => setDocumentLanguage("en")).not.toThrow();
    global.document = orig;
  });
});

describe("i18n/client – initialization branches", () => {
  afterEach(() => {
    jest.resetModules();
  });

  it("calls i18n.use().init() when i18n is not yet initialized", () => {
    const useMock = jest.fn().mockReturnThis();
    const initMock = jest.fn().mockResolvedValue(undefined);

    jest.isolateModules(() => {
      jest.doMock("i18next", () => ({
        default: {
          isInitialized: false,
          use: useMock,
          init: initMock,
        },
        __esModule: true,
      }));
      jest.doMock("react-i18next", () => ({
        initReactI18next: { type: "3rdParty", init: jest.fn() },
      }));
      require("@/i18n/client");
    });

    expect(useMock).toHaveBeenCalled();
    expect(initMock).toHaveBeenCalled();
  });

  it("skips init when i18n is already initialized", () => {
    const useMock = jest.fn().mockReturnThis();
    const initMock = jest.fn().mockResolvedValue(undefined);

    jest.isolateModules(() => {
      jest.doMock("i18next", () => ({
        default: {
          isInitialized: true,
          use: useMock,
          init: initMock,
        },
        __esModule: true,
      }));
      jest.doMock("react-i18next", () => ({
        initReactI18next: { type: "3rdParty", init: jest.fn() },
      }));
      require("@/i18n/client");
    });

    expect(useMock).not.toHaveBeenCalled();
    expect(initMock).not.toHaveBeenCalled();
  });
});
