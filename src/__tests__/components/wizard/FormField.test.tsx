import { render, screen } from "@testing-library/react";
import { User } from "lucide-react";
import { FormField, formControlClass } from "@/components/wizard/FormField";

describe("FormField", () => {
  it("renders the label text", () => {
    render(
      <FormField id="name" label="Full Name" icon={User}>
        <input id="name" />
      </FormField>,
    );
    expect(screen.getByText("Full Name")).toBeInTheDocument();
  });

  it("renders a required asterisk when required=true", () => {
    render(
      <FormField id="name" label="Full Name" required icon={User}>
        <input id="name" />
      </FormField>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("does not render asterisk when required is not set", () => {
    render(
      <FormField id="name" label="Full Name" icon={User}>
        <input id="name" />
      </FormField>,
    );
    expect(screen.queryByText("*")).toBeNull();
  });

  it("renders the children", () => {
    render(
      <FormField id="email" label="Email" icon={User}>
        <input id="email" data-testid="email-input" />
      </FormField>,
    );
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
  });

  it("renders error message when error prop is provided", () => {
    render(
      <FormField id="name" label="Full Name" icon={User} error="This field is required">
        <input id="name" />
      </FormField>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("This field is required");
  });

  it("does not render error element when error is absent", () => {
    render(
      <FormField id="name" label="Full Name" icon={User}>
        <input id="name" />
      </FormField>,
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders labelAction when provided", () => {
    render(
      <FormField
        id="name"
        label="Name"
        icon={User}
        labelAction={<button type="button">Help</button>}
      >
        <input id="name" />
      </FormField>,
    );
    expect(screen.getByRole("button", { name: "Help" })).toBeInTheDocument();
  });

  it("applies iconTop alignment class when iconTop=true", () => {
    const { container } = render(
      <FormField id="name" label="Name" icon={User} iconTop>
        <textarea id="name" />
      </FormField>,
    );
    expect(container.querySelector(".items-stretch")).toBeInTheDocument();
  });

  it("applies default items-center class when iconTop is not set", () => {
    const { container } = render(
      <FormField id="name" label="Name" icon={User}>
        <input id="name" />
      </FormField>,
    );
    expect(container.querySelector(".items-center")).toBeInTheDocument();
  });

  it("applies custom className to wrapper", () => {
    const { container } = render(
      <FormField id="name" label="Name" icon={User} className="md:col-span-2">
        <input id="name" />
      </FormField>,
    );
    expect(container.firstChild).toHaveClass("md:col-span-2");
  });

  it("exports formControlClass constant", () => {
    expect(typeof formControlClass).toBe("string");
    expect(formControlClass.length).toBeGreaterThan(0);
  });
});
