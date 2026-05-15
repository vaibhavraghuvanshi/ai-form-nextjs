/**
 * Example tests for usePrefersReducedMotion hook.
 * Uses the real implementation against the matchMedia stub defined in jest.setup.ts.
 */
import { renderHook, act } from "@testing-library/react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

describe("usePrefersReducedMotion", () => {
  it("returns false when matchMedia does not match", () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when matchMedia matches", () => {
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => {
      const listeners: Array<(e: { matches: boolean }) => void> = [];
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn((_: string, cb: (e: { matches: boolean }) => void) => {
          listeners.push(cb);
        }),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    });

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it("updates when the media query changes", () => {
    let changeHandler: (() => void) | null = null;
    // The hook reads mq.matches inside the listener, so we need a mutable object
    const mqMock = {
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((_: string, cb: () => void) => {
        changeHandler = cb;
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
    (window.matchMedia as jest.Mock).mockReturnValue(mqMock);

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      // mutate matches then fire the stored listener (hook reads mq.matches directly)
      mqMock.matches = true;
      changeHandler?.();
    });
    expect(result.current).toBe(true);
  });
});
