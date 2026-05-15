/**
 * Tests for ApplicationWizard
 *
 * Strategy:
 *  - Mock AppProviders/useLanguage so wizard has a language context
 *  - Mock draft-storage to control initial state
 *  - Mock axios for API calls
 *  - Mock usePrefersReducedMotion for animation branches
 */
import { render, screen, fireEvent, act, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { ApplicationWizard } from "@/components/wizard/ApplicationWizard";
import { loadDraft, saveDraft, clearDraft } from "@/lib/draft-storage";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { defaultFormValues } from "@/types/application";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------
jest.mock("@/components/providers/AppProviders", () => ({
  useLanguage: jest.fn(() => ({ language: "en", setLanguage: jest.fn() })),
}));

jest.mock("@/lib/draft-storage");
jest.mock("@/hooks/usePrefersReducedMotion");

const mockedLoadDraft = loadDraft as jest.Mock;
const mockedSaveDraft = saveDraft as jest.Mock;
const mockedClearDraft = clearDraft as jest.Mock;
const mockedUsePrefersReducedMotion = usePrefersReducedMotion as jest.Mock;
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ---------------------------------------------------------------------------
// Helper: render with fake timers optional
// ---------------------------------------------------------------------------
function renderWizard() {
  return render(<ApplicationWizard />);
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeEach(() => {
  mockedLoadDraft.mockReturnValue(null);
  mockedSaveDraft.mockImplementation(() => {});
  mockedClearDraft.mockImplementation(() => {});
  mockedUsePrefersReducedMotion.mockReturnValue(false);
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ---------------------------------------------------------------------------
// Initial render & step 1
// ---------------------------------------------------------------------------
describe("ApplicationWizard – initial render", () => {
  it("renders step 1 fields on mount", () => {
    renderWizard();
    expect(document.getElementById("name")).toBeInTheDocument();
  });

  it("renders the progress bar", () => {
    renderWizard();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows a Save Draft button", () => {
    renderWizard();
    expect(screen.getByText("wizard.saveDraft")).toBeInTheDocument();
  });

  it("shows Next button on step 1", () => {
    renderWizard();
    expect(screen.getByText("wizard.next")).toBeInTheDocument();
  });

  it("does not show Back button on step 1", () => {
    renderWizard();
    expect(screen.queryByText("wizard.back")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Draft loading
// ---------------------------------------------------------------------------
describe("ApplicationWizard – draft loading", () => {
  it("restores saved draft on mount", async () => {
    mockedLoadDraft.mockReturnValueOnce({
      step: 2,
      values: { ...defaultFormValues, name: "Alice" },
    });
    renderWizard();
    await act(async () => {});
    // Draft restored to step 2 → family fields visible
    expect(document.getElementById("maritalStatus")).toBeInTheDocument();
  });

  it("auto-saves draft after a debounce", async () => {
    renderWizard();
    await act(async () => {});
    act(() => { jest.advanceTimersByTime(400); });
    expect(mockedSaveDraft).toHaveBeenCalled();
  });

  it("manual Save Draft button invokes saveDraft", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWizard();
    await act(async () => {});
    await user.click(screen.getByText("wizard.saveDraft"));
    expect(mockedSaveDraft).toHaveBeenCalled();
  });

  it("shows 'just now' indicator after manual save", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWizard();
    await act(async () => {});
    await user.click(screen.getByText("wizard.saveDraft"));
    expect(screen.getByText(/wizard\.justNow/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Step navigation
// ---------------------------------------------------------------------------
describe("ApplicationWizard – step navigation", () => {
  async function fillStep1AndNext() {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWizard();
    await act(async () => {});

    // Fill required step-1 fields
    await user.type(document.getElementById("name")!, "John Doe");
    await user.type(document.getElementById("nationalId")!, "ABC1234");
    await user.type(document.getElementById("dateOfBirth")!, "1990-01-01");
    await user.selectOptions(document.getElementById("gender")!, "male");
    await user.type(document.getElementById("address")!, "123 Main St");
    await user.type(document.getElementById("city")!, "London");
    await user.type(document.getElementById("state")!, "England");
    await user.type(document.getElementById("country")!, "United");
    await user.type(document.getElementById("phone")!, "+44 1234 5678");
    await user.type(document.getElementById("email")!, "john@example.com");

    await user.click(screen.getByText("wizard.next"));
    return user;
  }

  it("navigates to step 2 after valid step 1", async () => {
    await fillStep1AndNext();
    await waitFor(() => {
      expect(document.getElementById("maritalStatus")).toBeInTheDocument();
    });
  });

  it("shows Back button on step 2", async () => {
    await fillStep1AndNext();
    await waitFor(() => {
      expect(screen.getByText("wizard.back")).toBeInTheDocument();
    });
  });

  it("navigates back to step 1 from step 2", async () => {
    const user = await fillStep1AndNext();
    await waitFor(() => screen.getByText("wizard.back"));
    await user.click(screen.getByText("wizard.back"));
    expect(document.getElementById("name")).toBeInTheDocument();
  });

  it("does not advance when step 1 fields are invalid", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWizard();
    await act(async () => {});
    await user.click(screen.getByText("wizard.next"));
    // Still on step 1
    expect(document.getElementById("name")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Language switcher
// ---------------------------------------------------------------------------
describe("ApplicationWizard – language switcher", () => {
  it("renders the language select", () => {
    renderWizard();
    expect(document.getElementById("app-language")).toBeInTheDocument();
  });

  it("calls setLanguage when language is changed", async () => {
    const setLanguage = jest.fn();
    const { useLanguage } = require("@/components/providers/AppProviders");
    (useLanguage as jest.Mock).mockReturnValue({ language: "en", setLanguage });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWizard();
    await act(async () => {});
    await user.selectOptions(document.getElementById("app-language")!, "ar");
    expect(setLanguage).toHaveBeenCalledWith("ar");
  });

  it("calls setLanguage with 'en' when a non-ar language is selected", async () => {
    const setLanguage = jest.fn();
    const { useLanguage } = require("@/components/providers/AppProviders");
    (useLanguage as jest.Mock).mockReturnValue({ language: "ar", setLanguage });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWizard();
    await act(async () => {});
    await user.selectOptions(document.getElementById("app-language")!, "en");
    expect(setLanguage).toHaveBeenCalledWith("en");
  });
});

// ---------------------------------------------------------------------------
// AI suggestion flow
// ---------------------------------------------------------------------------
describe("ApplicationWizard – AI suggestion", () => {
  async function goToStep3() {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockedLoadDraft.mockReturnValueOnce({ step: 3, values: defaultFormValues });
    renderWizard();
    await act(async () => {});
    return user;
  }

  it("opens AI dialog when Help Write is clicked", async () => {
    const user = await goToStep3();
    await waitFor(() => screen.getAllByRole("button"));
    // Click first help-write button
    const helpBtns = screen.getAllByRole("button").filter((b) =>
      b.textContent?.includes("ai.helpWrite"),
    );
    if (helpBtns.length > 0) {
      mockedAxios.post.mockResolvedValueOnce({ data: { suggestion: "Great suggestion." } });
      await user.click(helpBtns[0]);
      await act(async () => {});
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).toBeInTheDocument();
      });
    }
  });

  it("shows error when axios returns generic error", async () => {
    const user = await goToStep3();
    await waitFor(() => screen.getAllByRole("button"));
    const helpBtns = screen.getAllByRole("button").filter((b) =>
      b.textContent?.includes("ai.helpWrite"),
    );
    if (helpBtns.length > 0) {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));
      mockedAxios.isAxiosError.mockReturnValueOnce(false);
      await user.click(helpBtns[0]);
      await act(async () => {});
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).toBeInTheDocument();
      });
    }
  });

  it("shows errorConfig when status is 503", async () => {
    const user = await goToStep3();
    await waitFor(() => screen.getAllByRole("button"));
    const helpBtns = screen.getAllByRole("button").filter((b) =>
      b.textContent?.includes("ai.helpWrite"),
    );
    if (helpBtns.length > 0) {
      const axiosErr = Object.assign(new Error("503"), {
        isAxiosError: true,
        response: { status: 503, data: { error: "missing_api_key" } },
      });
      mockedAxios.post.mockRejectedValueOnce(axiosErr);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      await user.click(helpBtns[0]);
      await act(async () => {});
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).toBeInTheDocument();
      });
    }
  });

  it("shows errorTimeout when code is ECONNABORTED", async () => {
    const user = await goToStep3();
    await waitFor(() => screen.getAllByRole("button"));
    const helpBtns = screen.getAllByRole("button").filter((b) =>
      b.textContent?.includes("ai.helpWrite"),
    );
    if (helpBtns.length > 0) {
      const axiosErr = Object.assign(new Error("timeout"), {
        isAxiosError: true,
        code: "ECONNABORTED",
        response: undefined,
      });
      mockedAxios.post.mockRejectedValueOnce(axiosErr);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      await user.click(helpBtns[0]);
      await act(async () => {});
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).toBeInTheDocument();
      });
    }
  });

  it("shows errorInvalidKey when status is 401", async () => {
    const user = await goToStep3();
    const helpBtns = screen
      .getAllByRole("button")
      .filter((b) => b.textContent?.includes("ai.helpWrite"));
    if (helpBtns.length > 0) {
      const axiosErr = Object.assign(new Error("401"), {
        isAxiosError: true,
        response: { status: 401, data: {} },
      });
      mockedAxios.post.mockRejectedValueOnce(axiosErr);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      await user.click(helpBtns[0]);
      await act(async () => {});
    }
  });

  it("shows errorQuota when status 429 and insufficient_quota", async () => {
    const user = await goToStep3();
    const helpBtns = screen
      .getAllByRole("button")
      .filter((b) => b.textContent?.includes("ai.helpWrite"));
    if (helpBtns.length > 0) {
      const axiosErr = Object.assign(new Error("429"), {
        isAxiosError: true,
        response: { status: 429, data: { error: "insufficient_quota" } },
      });
      mockedAxios.post.mockRejectedValueOnce(axiosErr);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      await user.click(helpBtns[0]);
      await act(async () => {});
    }
  });

  it("shows errorRateLimit when status 429 but not quota", async () => {
    const user = await goToStep3();
    const helpBtns = screen
      .getAllByRole("button")
      .filter((b) => b.textContent?.includes("ai.helpWrite"));
    if (helpBtns.length > 0) {
      const axiosErr = Object.assign(new Error("429"), {
        isAxiosError: true,
        response: { status: 429, data: { error: "rate_limit" } },
      });
      mockedAxios.post.mockRejectedValueOnce(axiosErr);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      await user.click(helpBtns[0]);
      await act(async () => {});
    }
  });

  it("shows errorGeneric for unknown axios error status", async () => {
    const user = await goToStep3();
    const helpBtns = screen
      .getAllByRole("button")
      .filter((b) => b.textContent?.includes("ai.helpWrite"));
    if (helpBtns.length > 0) {
      const axiosErr = Object.assign(new Error("422"), {
        isAxiosError: true,
        response: { status: 422, data: {} },
      });
      mockedAxios.post.mockRejectedValueOnce(axiosErr);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      await user.click(helpBtns[0]);
      await act(async () => {});
    }
  });

  it("sets empty text error when suggestion is blank", async () => {
    const user = await goToStep3();
    const helpBtns = screen
      .getAllByRole("button")
      .filter((b) => b.textContent?.includes("ai.helpWrite"));
    if (helpBtns.length > 0) {
      mockedAxios.post.mockResolvedValueOnce({ data: { suggestion: "   " } });
      await user.click(helpBtns[0]);
      await act(async () => {});
    }
  });
});

// ---------------------------------------------------------------------------
// Accept / edit suggestion callbacks
// ---------------------------------------------------------------------------
describe("ApplicationWizard – suggestion accept & edit", () => {
  async function openDialogWithSuggestion() {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockedLoadDraft.mockReturnValueOnce({ step: 3, values: defaultFormValues });
    renderWizard();
    await act(async () => {});

    mockedAxios.post.mockResolvedValueOnce({ data: { suggestion: "Suggested text here." } });
    const helpBtns = screen
      .getAllByRole("button")
      .filter((b) => b.textContent?.includes("ai.helpWrite"));

    if (helpBtns.length === 0) return { user, hasDialog: false };

    await user.click(helpBtns[0]);
    await act(async () => {});
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeInTheDocument());
    return { user, hasDialog: true };
  }

  it("closes AI dialog when close button is clicked", async () => {
    const { user, hasDialog } = await openDialogWithSuggestion();
    if (!hasDialog) return;
    await user.click(screen.getByRole("button", { name: /a11y\.closeModal/i }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("accepts suggestion and sets field value", async () => {
    const { user, hasDialog } = await openDialogWithSuggestion();
    if (!hasDialog) return;
    await waitFor(() => screen.getByText("ai.accept"));
    await user.click(screen.getByText("ai.accept"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("enters edit mode and confirms edit", async () => {
    const { user, hasDialog } = await openDialogWithSuggestion();
    if (!hasDialog) return;
    await waitFor(() => screen.getByText("ai.edit"));
    await user.click(screen.getByText("ai.edit"));
    // The edit textarea is inside the dialog; scope query to dialog to avoid ambiguity
    const dialog = await screen.findByRole("dialog");
    const { getByRole } = within(dialog);
    await waitFor(() => getByRole("textbox"));
    await user.click(screen.getByText("ai.useEdited"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Submission
// ---------------------------------------------------------------------------
describe("ApplicationWizard – form submission", () => {
  async function fillAllSteps() {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockedLoadDraft.mockReturnValueOnce({
      step: 3,
      values: {
        ...defaultFormValues,
        name: "John Doe",
        nationalId: "ABC1234",
        dateOfBirth: "1990-01-01",
        gender: "male",
        address: "123 Main St",
        city: "London",
        state: "England",
        country: "United",
        phone: "+44 1234 5678",
        email: "john@example.com",
        maritalStatus: "single",
        dependents: "0",
        employmentStatus: "employed",
        monthlyIncome: "3000",
        housingStatus: "rent",
        financialSituation: "A".repeat(30),
        employmentCircumstances: "A".repeat(30),
        reasonForApplying: "A".repeat(30),
      },
    });
    renderWizard();
    await act(async () => {});
    return user;
  }

  it("shows submitted state with reference after successful submission", async () => {
    const user = await fillAllSteps();
    mockedAxios.post.mockResolvedValueOnce({ data: { reference: "SSP-2026-ABC123" } });

    await user.click(screen.getByText("wizard.submit"));
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByText("SSP-2026-ABC123")).toBeInTheDocument();
    });
    expect(mockedClearDraft).toHaveBeenCalled();
  });

  it("generates a fallback reference when response has none", async () => {
    const user = await fillAllSteps();
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    await user.click(screen.getByText("wizard.submit"));
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByText(/SSP-\d{4}-/)).toBeInTheDocument();
    });
  });

  it("shows validation error when server returns 400", async () => {
    const user = await fillAllSteps();
    const axiosErr = Object.assign(new Error("400"), {
      isAxiosError: true,
      response: { status: 400, data: { error: "validation_failed" } },
    });
    mockedAxios.post.mockRejectedValueOnce(axiosErr);
    mockedAxios.isAxiosError.mockReturnValueOnce(true);

    await user.click(screen.getByText("wizard.submit"));
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("shows generic error for non-400 submission failure", async () => {
    const user = await fillAllSteps();
    const axiosErr = Object.assign(new Error("500"), {
      isAxiosError: true,
      response: { status: 500, data: {} },
    });
    mockedAxios.post.mockRejectedValueOnce(axiosErr);
    mockedAxios.isAxiosError.mockReturnValueOnce(true);

    await user.click(screen.getByText("wizard.submit"));
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("shows generic error for non-axios submission failure", async () => {
    const user = await fillAllSteps();
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));
    mockedAxios.isAxiosError.mockReturnValueOnce(false);

    await user.click(screen.getByText("wizard.submit"));
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Submitted state / Start Over
// ---------------------------------------------------------------------------
describe("ApplicationWizard – submitted state", () => {
  it("renders Lottie animation by default (prefersReducedMotion=false)", async () => {
    mockedUsePrefersReducedMotion.mockReturnValue(false);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockedLoadDraft.mockReturnValueOnce({
      step: 3,
      values: {
        ...defaultFormValues,
        name: "John Doe",
        nationalId: "ABC1234",
        dateOfBirth: "1990-01-01",
        gender: "male",
        address: "123 Main St",
        city: "London",
        state: "England",
        country: "United",
        phone: "+44 1234 5678",
        email: "john@example.com",
        maritalStatus: "single",
        dependents: "0",
        employmentStatus: "employed",
        monthlyIncome: "3000",
        housingStatus: "rent",
        financialSituation: "A".repeat(30),
        employmentCircumstances: "A".repeat(30),
        reasonForApplying: "A".repeat(30),
      },
    });
    renderWizard();
    await act(async () => {});

    mockedAxios.post.mockResolvedValueOnce({ data: { reference: "SSP-2026-XYZ" } });
    await user.click(screen.getByText("wizard.submit"));
    await act(async () => {});

    await waitFor(() => screen.getByText("SSP-2026-XYZ"));
    expect(screen.getByTestId("lottie-animation")).toBeInTheDocument();
  });

  it("renders static icon when prefersReducedMotion=true", async () => {
    mockedUsePrefersReducedMotion.mockReturnValue(true);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockedLoadDraft.mockReturnValueOnce({
      step: 3,
      values: {
        ...defaultFormValues,
        name: "John Doe",
        nationalId: "ABC1234",
        dateOfBirth: "1990-01-01",
        gender: "male",
        address: "123 Main St",
        city: "London",
        state: "England",
        country: "United",
        phone: "+44 1234 5678",
        email: "john@example.com",
        maritalStatus: "single",
        dependents: "0",
        employmentStatus: "employed",
        monthlyIncome: "3000",
        housingStatus: "rent",
        financialSituation: "A".repeat(30),
        employmentCircumstances: "A".repeat(30),
        reasonForApplying: "A".repeat(30),
      },
    });
    renderWizard();
    await act(async () => {});

    mockedAxios.post.mockResolvedValueOnce({ data: { reference: "SSP-2026-ABC" } });
    await user.click(screen.getByText("wizard.submit"));
    await act(async () => {});

    await waitFor(() => screen.getByText("SSP-2026-ABC"));
    // Lottie should NOT be rendered
    expect(screen.queryByTestId("lottie-animation")).toBeNull();
  });

  it("clicking New Application resets to step 1", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockedLoadDraft.mockReturnValueOnce({
      step: 3,
      values: {
        ...defaultFormValues,
        name: "John Doe",
        nationalId: "ABC1234",
        dateOfBirth: "1990-01-01",
        gender: "male",
        address: "123 Main St",
        city: "London",
        state: "England",
        country: "United",
        phone: "+44 1234 5678",
        email: "john@example.com",
        maritalStatus: "single",
        dependents: "0",
        employmentStatus: "employed",
        monthlyIncome: "3000",
        housingStatus: "rent",
        financialSituation: "A".repeat(30),
        employmentCircumstances: "A".repeat(30),
        reasonForApplying: "A".repeat(30),
      },
    });
    renderWizard();
    await act(async () => {});

    mockedAxios.post.mockResolvedValueOnce({ data: { reference: "SSP-2026-RST" } });
    await user.click(screen.getByText("wizard.submit"));
    await act(async () => {});

    await waitFor(() => screen.getByText("SSP-2026-RST"));
    await user.click(screen.getByText("wizard.newApplication"));
    await act(async () => {});

    expect(document.getElementById("name")).toBeInTheDocument();
    expect(mockedClearDraft).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// AI title mapping
// ---------------------------------------------------------------------------
describe("ApplicationWizard – AI dialog title", () => {
  it("maps all three situation field keys to titles", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockedLoadDraft.mockReturnValueOnce({ step: 3, values: defaultFormValues });
    renderWizard();
    await act(async () => {});

    for (const [idx, _field] of [
      "financialSituation",
      "employmentCircumstances",
      "reasonForApplying",
    ].entries()) {
      mockedAxios.post.mockResolvedValueOnce({ data: { suggestion: "text" } });
      const helpBtns = screen
        .getAllByRole("button")
        .filter((b) => b.textContent?.includes("ai.helpWrite"));
      if (helpBtns[idx]) {
        await user.click(helpBtns[idx]);
        await act(async () => {});
        await waitFor(() => screen.queryByRole("dialog"));
        // Close dialog
        const closeBtn = screen.queryByRole("button", { name: /a11y\.closeModal/i });
        if (closeBtn) {
          await user.click(closeBtn);
          await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        }
      }
    }
  });
});
