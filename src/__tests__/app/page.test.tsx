import { render } from "@testing-library/react";
import Home from "@/app/page";

// Mock ApplicationWizard to isolate page rendering
jest.mock("@/components/wizard/ApplicationWizard", () => ({
  ApplicationWizard: () => <div data-testid="application-wizard" />,
}));

describe("Home page", () => {
  it("renders a main element with ApplicationWizard inside", () => {
    const { getByRole, getByTestId } = render(<Home />);
    expect(getByRole("main")).toBeInTheDocument();
    expect(getByTestId("application-wizard")).toBeInTheDocument();
  });
});
