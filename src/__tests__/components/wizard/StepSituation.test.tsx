import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import type { ApplicationFormValues, SituationFieldKey } from "@/types/application";
import { defaultFormValues } from "@/types/application";
import { StepSituation } from "@/components/wizard/StepSituation";

function Wrapper({
  children,
  onHelpWrite = jest.fn(),
  busyField = null,
}: {
  children?: React.ReactNode;
  onHelpWrite?: jest.Mock;
  busyField?: SituationFieldKey | null;
}) {
  const methods = useForm<ApplicationFormValues>({ defaultValues: defaultFormValues });
  return (
    <FormProvider {...methods}>
      <StepSituation onHelpWrite={onHelpWrite} busyField={busyField} />
      {children}
    </FormProvider>
  );
}

describe("StepSituation", () => {
  it("renders the situation fieldset", () => {
    render(<Wrapper />);
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  it("renders all three textarea fields", () => {
    render(<Wrapper />);
    expect(document.getElementById("financialSituation")).toBeInTheDocument();
    expect(document.getElementById("employmentCircumstances")).toBeInTheDocument();
    expect(document.getElementById("reasonForApplying")).toBeInTheDocument();
  });

  it("renders Help Write buttons for each field", () => {
    render(<Wrapper />);
    const helpButtons = screen.getAllByRole("button");
    expect(helpButtons.length).toBeGreaterThanOrEqual(3);
  });

  it("calls onHelpWrite with the correct fieldKey when Help button is clicked", () => {
    const onHelpWrite = jest.fn();
    render(<Wrapper onHelpWrite={onHelpWrite} />);
    const [firstBtn] = screen.getAllByRole("button");
    fireEvent.click(firstBtn);
    expect(onHelpWrite).toHaveBeenCalledWith("financialSituation");
  });

  it("disables the button for the busy field", () => {
    render(<Wrapper busyField="financialSituation" />);
    const allButtons = screen.getAllByRole("button");
    // The financialSituation help button (first) should be disabled
    expect(allButtons[0]).toBeDisabled();
    // Others should be enabled
    expect(allButtons[1]).not.toBeDisabled();
  });

  it("enables all buttons when busyField is null", () => {
    render(<Wrapper busyField={null} />);
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });
  });

  it("disables employmentCircumstances button when that field is busy", () => {
    render(<Wrapper busyField="employmentCircumstances" />);
    const allButtons = screen.getAllByRole("button");
    expect(allButtons[1]).toBeDisabled();
  });

  it("disables reasonForApplying button when that field is busy", () => {
    render(<Wrapper busyField="reasonForApplying" />);
    const allButtons = screen.getAllByRole("button");
    expect(allButtons[2]).toBeDisabled();
  });

  it("renders with aria-invalid=true when fields have errors", async () => {
    function WrapperWithErrors() {
      const methods = useForm<ApplicationFormValues>({ defaultValues: defaultFormValues });
      React.useEffect(() => {
        (["financialSituation", "employmentCircumstances", "reasonForApplying"] as const).forEach((f) =>
          methods.setError(f, { type: "manual", message: "error" })
        );
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return (
        <FormProvider {...methods}>
          <StepSituation onHelpWrite={jest.fn()} busyField={null} />
        </FormProvider>
      );
    }
    render(<WrapperWithErrors />);
    await act(async () => {});
    const invalid = document.querySelector('[aria-invalid="true"]');
    expect(invalid).not.toBeNull();
  });
});
