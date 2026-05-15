// Extend jest matchers with @testing-library/jest-dom assertions
// e.g. toBeInTheDocument(), toHaveTextContent(), toBeVisible(), etc.
import "@testing-library/jest-dom";

// ---------------------------------------------------------------------------
// Global browser API stubs
// ---------------------------------------------------------------------------

// matchMedia — jsdom does not implement this; required by usePrefersReducedMotion
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated but still used by some libs
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// ResizeObserver — not available in jsdom
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// IntersectionObserver — not available in jsdom
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  root: null,
  rootMargin: "",
  thresholds: [],
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => []),
}));

// Scroll APIs — jsdom stubs
window.scrollTo = jest.fn();
Element.prototype.scrollIntoView = jest.fn();

// localStorage / sessionStorage — use jest-localstorage-mock pattern inline
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, "localStorage", { value: storageMock });
Object.defineProperty(window, "sessionStorage", { value: storageMock });

// ---------------------------------------------------------------------------
// Web APIs required by Next.js App Router route handlers
// ---------------------------------------------------------------------------
if (typeof globalThis.Request === "undefined") {
  // @ts-expect-error – polyfill for jsdom
  globalThis.Request = class Request {
    readonly url: string;
    readonly method: string;
    private _body: string;
    constructor(input: string, init: { method?: string; body?: string } = {}) {
      this.url = input;
      this.method = init.method ?? "GET";
      this._body = init.body ?? "";
    }
    async json() { return JSON.parse(this._body); }
    async text() { return this._body; }
  };
}
if (typeof globalThis.Response === "undefined") {
  // @ts-expect-error – polyfill for jsdom
  globalThis.Response = class Response {
    readonly status: number;
    private _body: string;
    constructor(body: string, init: { status?: number } = {}) {
      this._body = body;
      this.status = init.status ?? 200;
    }
    async json() { return JSON.parse(this._body); }
    static json(data: unknown, init: { status?: number } = {}) {
      return new (globalThis.Response as any)(JSON.stringify(data), init);
    }
  };
}

// ---------------------------------------------------------------------------
// Global cleanup between tests
// ---------------------------------------------------------------------------
beforeEach(() => {
  storageMock.clear();
  jest.clearAllMocks();
});
