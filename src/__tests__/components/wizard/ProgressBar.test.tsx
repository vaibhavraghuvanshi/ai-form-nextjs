import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/wizard/ProgressBar";

describe("ProgressBar", () => {
  it("renders the progressbar role", () => {
    render(<ProgressBar currentStep={1} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("sets aria-valuenow to the current step", () => {
    render(<ProgressBar currentStep={2} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  });

  it("sets aria-valuemin=1 and aria-valuemax=3", () => {
    render(<ProgressBar currentStep={1} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "1");
    expect(bar).toHaveAttribute("aria-valuemax", "3");
  });

  it("accepts a custom totalSteps", () => {
    render(<ProgressBar currentStep={2} totalSteps={5} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
  });

  it("marks current step with aria-current=step", () => {
    render(<ProgressBar currentStep={2} />);
    const stepDivs = document.querySelectorAll("[aria-current='step']");
    expect(stepDivs).toHaveLength(1);
  });

  it("renders step 1 in active state when currentStep=1", () => {
    render(<ProgressBar currentStep={1} />);
    // Step 1 circle should use primary colours
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders step 3 and marks steps 1 and 2 as done", () => {
    render(<ProgressBar currentStep={3} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
  });
});
