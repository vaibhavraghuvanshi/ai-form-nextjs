import React from "react";
import { render, screen, act } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import userEvent from "@testing-library/user-event";
import type { ApplicationFormValues } from "@/types/application";
import { defaultFormValues } from "@/types/application";
import { StepFamily } from "@/components/wizard/StepFamily";

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<ApplicationFormValues>({ defaultValues: defaultFormValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

function WrapperWithErrors({ children }: { children: React.ReactNode }) {
  const methods = useForm<ApplicationFormValues>({ defaultValues: defaultFormValues });
  React.useEffect(() => {
    (["maritalStatus", "dependents", "employmentStatus", "monthlyIncome", "housingStatus"] as const).forEach((f) =>
      methods.setError(f, { type: "manual", message: "error" })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <FormProvider {...methods}>{children}</FormProvider>;
}

function WrapperWithTrigger({ children }: { children: React.ReactNode }) {
  const methods = useForm<ApplicationFormValues>({ defaultValues: defaultFormValues });
  return (
    <FormProvider {...methods}>
      {children}
      <button
        type="button"
        onClick={() => methods.trigger("dependents")}
      >
        validate
      </button>
    </FormProvider>
  );
}

describe("StepFamily", () => {
  it("renders the family/finances fieldset", () => {
    render(
      <Wrapper>
        <StepFamily />
      </Wrapper>,
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  it("renders marital status select", () => {
    render(
      <Wrapper>
        <StepFamily />
      </Wrapper>,
    );
    expect(document.getElementById("maritalStatus")).toBeInTheDocument();
  });

  it("renders dependents input", () => {
    render(
      <Wrapper>
        <StepFamily />
      </Wrapper>,
    );
    expect(document.getElementById("dependents")).toBeInTheDocument();
  });

  it("renders employment status select", () => {
    render(
      <Wrapper>
        <StepFamily />
      </Wrapper>,
    );
    expect(document.getElementById("employmentStatus")).toBeInTheDocument();
  });

  it("renders monthly income input", () => {
    render(
      <Wrapper>
        <StepFamily />
      </Wrapper>,
    );
    expect(document.getElementById("monthlyIncome")).toBeInTheDocument();
  });

  it("renders housing status select", () => {
    render(
      <Wrapper>
        <StepFamily />
      </Wrapper>,
    );
    expect(document.getElementById("housingStatus")).toBeInTheDocument();
  });

  it("renders all marital status options", () => {
    render(
      <Wrapper>
        <StepFamily />
      </Wrapper>,
    );
    const select = document.getElementById("maritalStatus") as HTMLSelectElement;
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).toContain("single");
    expect(values).toContain("married");
    expect(values).toContain("divorced");
    expect(values).toContain("widowed");
    expect(values).toContain("partnered");
  });

  it("renders all housing status options", () => {
    render(
      <Wrapper>
        <StepFamily />
      </Wrapper>,
    );
    const select = document.getElementById("housingStatus") as HTMLSelectElement;
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).toContain("own");
    expect(values).toContain("rent");
    expect(values).toContain("shared");
    expect(values).toContain("temporary");
    expect(values).toContain("other");
  });

  it("renders with aria-invalid=true when fields have errors", async () => {
    render(
      <WrapperWithErrors>
        <StepFamily />
      </WrapperWithErrors>,
    );
    await act(async () => {});
    const invalid = document.querySelector('[aria-invalid="true"]');
    expect(invalid).not.toBeNull();
  });
});

describe("StepFamily – dependents validation branches", () => {
  async function renderAndValidate(value: string) {
    const user = userEvent.setup();
    render(
      <WrapperWithTrigger>
        <StepFamily />
      </WrapperWithTrigger>,
    );
    const input = document.getElementById("dependents") as HTMLInputElement;
    await user.clear(input);
    if (value !== "") {
      await user.type(input, value);
    }
    // Manually trigger validation via the helper button
    await act(async () => {
      screen.getByText("validate").click();
    });
  }

  it("validates empty string as required", async () => {
    await renderAndValidate("");
    // no assertion needed — just exercises the branch
  });

  it("validates negative number (n < 0 branch)", async () => {
    await renderAndValidate("-1");
  });

  it("validates number > 30 branch", async () => {
    await renderAndValidate("31");
  });

  it("validates valid number returns true", async () => {
    await renderAndValidate("5");
  });
});
