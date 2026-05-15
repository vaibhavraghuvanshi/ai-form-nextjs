import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProviders, useLanguage } from "@/components/providers/AppProviders";

// Use the REAL AppProviders (not the src/__mocks__ version)
// React-i18next is auto-mocked via __mocks__/react-i18next.tsx

describe("AppProviders", () => {
  it("renders children", () => {
    render(
      <AppProviders>
        <div data-testid="child">hello</div>
      </AppProviders>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("restores language from localStorage on mount (ar)", async () => {
    (localStorage.getItem as jest.Mock).mockReturnValueOnce("ar");

    let capturedLang = "";
    function Reader() {
      const { language } = useLanguage();
      capturedLang = language;
      return null;
    }

    await act(async () => {
      render(
        <AppProviders>
          <Reader />
        </AppProviders>,
      );
    });

    expect(capturedLang).toBe("ar");
  });

  it("restores language from localStorage on mount (en)", async () => {
    (localStorage.getItem as jest.Mock).mockReturnValueOnce("en");

    let capturedLang = "";
    function Reader() {
      const { language } = useLanguage();
      capturedLang = language;
      return null;
    }

    await act(async () => {
      render(
        <AppProviders>
          <Reader />
        </AppProviders>,
      );
    });

    expect(capturedLang).toBe("en");
  });

  it("falls back to 'en' when localStorage has an invalid lang", async () => {
    (localStorage.getItem as jest.Mock).mockReturnValueOnce("fr");

    let capturedLang = "";
    function Reader() {
      const { language } = useLanguage();
      capturedLang = language;
      return null;
    }

    await act(async () => {
      render(
        <AppProviders>
          <Reader />
        </AppProviders>,
      );
    });

    expect(capturedLang).toBe("en");
  });

  it("handles localStorage.getItem throwing gracefully", async () => {
    (localStorage.getItem as jest.Mock).mockImplementationOnce(() => {
      throw new Error("QuotaExceeded");
    });

    await act(async () => {
      render(
        <AppProviders>
          <span />
        </AppProviders>,
      );
    });
    // No throw — component mounts with default language
  });
});

describe("useLanguage hook", () => {
  it("throws when called outside AppProviders", () => {
    // Suppress the expected console.error from React
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    function Broken() {
      useLanguage();
      return null;
    }
    expect(() => render(<Broken />)).toThrow("useLanguage must be used within AppProviders");
    spy.mockRestore();
  });

  it("returns language and setLanguage when inside AppProviders", () => {
    let result: ReturnType<typeof useLanguage> | null = null;
    function Reader() {
      result = useLanguage();
      return null;
    }
    render(
      <AppProviders>
        <Reader />
      </AppProviders>,
    );
    expect(result).not.toBeNull();
    expect(result!.language).toBe("en");
    expect(typeof result!.setLanguage).toBe("function");
  });

  it("setLanguage updates the language state to 'ar'", async () => {
    const user = userEvent.setup();
    let result: ReturnType<typeof useLanguage> | null = null;

    function Switcher() {
      result = useLanguage();
      return (
        <button onClick={() => result!.setLanguage("ar")}>switch</button>
      );
    }

    render(
      <AppProviders>
        <Switcher />
      </AppProviders>,
    );

    await user.click(screen.getByRole("button", { name: "switch" }));
    expect(result!.language).toBe("ar");
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "social-support-preferred-lang",
      "ar",
    );
  });

  it("setLanguage updates the language state to 'en'", async () => {
    const user = userEvent.setup();
    // Preload ar
    (localStorage.getItem as jest.Mock).mockReturnValueOnce("ar");

    let result: ReturnType<typeof useLanguage> | null = null;
    function Switcher() {
      result = useLanguage();
      return <button onClick={() => result!.setLanguage("en")}>switch</button>;
    }

    await act(async () => {
      render(
        <AppProviders>
          <Switcher />
        </AppProviders>,
      );
    });

    await user.click(screen.getByRole("button", { name: "switch" }));
    expect(result!.language).toBe("en");
  });

  it("setLanguage handles localStorage.setItem throwing gracefully", async () => {
    const user = userEvent.setup();
    (localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
      throw new Error("QuotaExceeded");
    });

    function Switcher() {
      const { setLanguage } = useLanguage();
      return <button onClick={() => setLanguage("ar")}>switch</button>;
    }

    render(
      <AppProviders>
        <Switcher />
      </AppProviders>,
    );

    // Should not throw
    await expect(user.click(screen.getByRole("button", { name: "switch" }))).resolves.not.toThrow();
  });
});
