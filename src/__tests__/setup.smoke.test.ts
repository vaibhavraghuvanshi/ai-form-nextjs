/**
 * Smoke test — verifies that the Jest + Testing Library infrastructure is
 * wired correctly before writing feature-level tests.
 */

describe("Jest setup smoke test", () => {
  it("loads @testing-library/jest-dom matchers", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(el).toBeInTheDocument();
    document.body.removeChild(el);
  });

  it("stubs localStorage via jest.setup.ts", () => {
    localStorage.setItem("key", "value");
    expect(localStorage.getItem("key")).toBe("value");
    localStorage.clear();
    expect(localStorage.getItem("key")).toBeNull();
  });

  it("stubs matchMedia", () => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    expect(mq.matches).toBe(false);
    expect(typeof mq.addEventListener).toBe("function");
  });
});
