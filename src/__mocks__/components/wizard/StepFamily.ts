/**
 * Mock for @/components/wizard/StepFamily
 *
 * Renders a form section stub for Step 2 (family & finances).
 */
import React from "react";

export const StepFamily = jest.fn(() =>
  React.createElement("div", { "data-testid": "step-family" }, "StepFamily"),
);
