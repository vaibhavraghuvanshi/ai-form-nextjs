import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiSuggestionDialog } from "@/components/wizard/AiSuggestionDialog";

const defaultProps = {
  open: true,
  title: "AI Suggestion",
  loading: false,
  error: null,
  suggestion: null,
  editMode: false,
  draftText: "",
  onClose: jest.fn(),
  onAccept: jest.fn(),
  onStartEdit: jest.fn(),
  onDiscard: jest.fn(),
  onChangeDraft: jest.fn(),
  onConfirmEdit: jest.fn(),
};

describe("AiSuggestionDialog – closed state", () => {
  it("renders nothing when open=false", () => {
    render(<AiSuggestionDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("AiSuggestionDialog – loading state", () => {
  it("shows a loading status message", () => {
    render(<AiSuggestionDialog {...defaultProps} loading={true} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows Close/Discard button during loading", () => {
    render(<AiSuggestionDialog {...defaultProps} loading={true} />);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });
});

describe("AiSuggestionDialog – error state", () => {
  it("displays the error message as an alert", () => {
    render(
      <AiSuggestionDialog {...defaultProps} error="Something went wrong" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("shows a Discard/Close button when in error state", () => {
    const onClose = jest.fn();
    render(
      <AiSuggestionDialog {...defaultProps} error="Err" onClose={onClose} />,
    );
    const buttons = screen.getAllByRole("button");
    // One is the × header close, one is the footer discard
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});

describe("AiSuggestionDialog – suggestion state", () => {
  it("displays the suggestion text", () => {
    render(
      <AiSuggestionDialog
        {...defaultProps}
        suggestion="Here is a great paragraph."
      />,
    );
    expect(screen.getByText("Here is a great paragraph.")).toBeInTheDocument();
  });

  it("calls onAccept when Accept button is clicked", async () => {
    const onAccept = jest.fn();
    const user = userEvent.setup();
    render(
      <AiSuggestionDialog
        {...defaultProps}
        suggestion="text"
        onAccept={onAccept}
      />,
    );
    await user.click(screen.getByText("ai.accept"));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("calls onDiscard when Discard button is clicked", async () => {
    const onDiscard = jest.fn();
    const user = userEvent.setup();
    render(
      <AiSuggestionDialog
        {...defaultProps}
        suggestion="text"
        onDiscard={onDiscard}
      />,
    );
    await user.click(screen.getByText("ai.discard"));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it("calls onStartEdit when Edit button is clicked", async () => {
    const onStartEdit = jest.fn();
    const user = userEvent.setup();
    render(
      <AiSuggestionDialog
        {...defaultProps}
        suggestion="text"
        onStartEdit={onStartEdit}
      />,
    );
    await user.click(screen.getByText("ai.edit"));
    expect(onStartEdit).toHaveBeenCalledTimes(1);
  });
});

describe("AiSuggestionDialog – edit mode", () => {
  it("renders a textarea with the draft text", () => {
    render(
      <AiSuggestionDialog
        {...defaultProps}
        editMode={true}
        draftText="Draft content"
      />,
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("Draft content");
  });

  it("calls onChangeDraft when textarea value changes", async () => {
    const onChangeDraft = jest.fn();
    const user = userEvent.setup();
    render(
      <AiSuggestionDialog
        {...defaultProps}
        editMode={true}
        draftText="Draft"
        onChangeDraft={onChangeDraft}
      />,
    );
    await user.type(screen.getByRole("textbox"), "x");
    expect(onChangeDraft).toHaveBeenCalled();
  });

  it("calls onConfirmEdit when 'Use Edited' button is clicked", async () => {
    const onConfirmEdit = jest.fn();
    const user = userEvent.setup();
    render(
      <AiSuggestionDialog
        {...defaultProps}
        editMode={true}
        draftText="Edited"
        onConfirmEdit={onConfirmEdit}
      />,
    );
    await user.click(screen.getByText("ai.useEdited"));
    expect(onConfirmEdit).toHaveBeenCalledTimes(1);
  });

  it("calls onDiscard in edit mode when Discard is clicked", async () => {
    const onDiscard = jest.fn();
    const user = userEvent.setup();
    render(
      <AiSuggestionDialog
        {...defaultProps}
        editMode={true}
        draftText="Edited"
        onDiscard={onDiscard}
      />,
    );
    await user.click(screen.getByText("ai.discard"));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });
});

describe("AiSuggestionDialog – header close button", () => {
  it("calls onClose when × button is clicked", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<AiSuggestionDialog {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: /a11y\.closeModal/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("AiSuggestionDialog – keyboard & backdrop", () => {
  it("calls onClose when Escape key is pressed inside the dialog", () => {
    const onClose = jest.fn();
    render(<AiSuggestionDialog {...defaultProps} onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not propagate Escape keydown", () => {
    const outer = jest.fn();
    const { container } = render(
      <div onKeyDown={outer}>
        <AiSuggestionDialog {...defaultProps} />
      </div>,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(outer).not.toHaveBeenCalled();
  });

  it("calls onClose when clicking the backdrop", () => {
    const onClose = jest.fn();
    render(<AiSuggestionDialog {...defaultProps} onClose={onClose} />);
    const presentation = document.querySelector("[role='presentation']")!;
    fireEvent.mouseDown(presentation);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClose when clicking inside the dialog panel", () => {
    const onClose = jest.fn();
    render(<AiSuggestionDialog {...defaultProps} onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    fireEvent.mouseDown(dialog);
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("AiSuggestionDialog – scroll lock effect", () => {
  it("sets body overflow to hidden when open", () => {
    render(<AiSuggestionDialog {...defaultProps} open={true} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body overflow when closed", () => {
    document.body.style.overflow = "";
    const { rerender } = render(<AiSuggestionDialog {...defaultProps} open={true} />);
    rerender(<AiSuggestionDialog {...defaultProps} open={false} />);
    expect(document.body.style.overflow).toBe("");
  });
});

describe("AiSuggestionDialog – focus management", () => {
  it("does not throw when opened and closed rapidly", async () => {
    jest.useFakeTimers();
    const { rerender } = render(<AiSuggestionDialog {...defaultProps} open={false} />);
    rerender(<AiSuggestionDialog {...defaultProps} open={true} />);
    act(() => { jest.runAllTimers(); });
    rerender(<AiSuggestionDialog {...defaultProps} open={false} />);
    jest.useRealTimers();
  });

  it("does not crash when reopened with loading=true then loading=false", async () => {
    jest.useFakeTimers();
    const { rerender } = render(<AiSuggestionDialog {...defaultProps} open={true} loading={true} />);
    act(() => { jest.runAllTimers(); });
    rerender(<AiSuggestionDialog {...defaultProps} open={true} loading={false} suggestion="text" />);
    act(() => { jest.runAllTimers(); });
    jest.useRealTimers();
    expect(screen.getByText("text")).toBeInTheDocument();
  });
});
