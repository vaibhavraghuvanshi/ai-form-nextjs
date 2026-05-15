import React from "react";
import { render, screen, act } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import type { ApplicationFormValues } from "@/types/application";
import { defaultFormValues } from "@/types/application";
import { StepPersonal } from "@/components/wizard/StepPersonal";

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<ApplicationFormValues>({ defaultValues: defaultFormValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

// A wrapper that sets errors on all personal fields to exercise aria-invalid="true" branches
function WrapperWithErrors({ children }: { children: React.ReactNode }) {
  const methods = useForm<ApplicationFormValues>({ defaultValues: defaultFormValues });
  React.useEffect(() => {
    (["name", "nationalId", "dateOfBirth", "gender", "address", "city", "state", "country", "phone", "email"] as const).forEach((f) =>
      methods.setError(f, { type: "manual", message: "error" })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("StepPersonal", () => {
  it("renders the personal info fieldset", () => {
    render(
      <Wrapper>
        <StepPersonal />
      </Wrapper>,
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  it("renders all personal information input fields", () => {
    render(
      <Wrapper>
        <StepPersonal />
      </Wrapper>,
    );
    expect(screen.getByRole("textbox", { name: /fields\.name/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /fields\.nationalId/i })).toBeInTheDocument();
  });

  it("renders the date of birth input", () => {
    render(
      <Wrapper>
        <StepPersonal />
      </Wrapper>,
    );
    expect(document.getElementById("dateOfBirth")).toBeInTheDocument();
  });

  it("renders gender, address, city, state, country fields", () => {
    render(
      <Wrapper>
        <StepPersonal />
      </Wrapper>,
    );
    expect(document.getElementById("gender")).toBeInTheDocument();
    expect(document.getElementById("address")).toBeInTheDocument();
    expect(document.getElementById("city")).toBeInTheDocument();
    expect(document.getElementById("state")).toBeInTheDocument();
    expect(document.getElementById("country")).toBeInTheDocument();
  });

  it("renders phone and email fields", () => {
    render(
      <Wrapper>
        <StepPersonal />
      </Wrapper>,
    );
    expect(document.getElementById("phone")).toBeInTheDocument();
    expect(document.getElementById("email")).toBeInTheDocument();
  });

  it("renders with aria-invalid=true when fields have errors", async () => {
    render(
      <WrapperWithErrors>
        <StepPersonal />
      </WrapperWithErrors>,
    );
    await act(async () => {});
    // At least one field should have aria-invalid="true" after errors are set
    const invalid = document.querySelector('[aria-invalid="true"]');
    expect(invalid).not.toBeNull();
  });
});
