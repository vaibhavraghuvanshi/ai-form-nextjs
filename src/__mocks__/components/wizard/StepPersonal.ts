/**
 * Mock for @/components/wizard/StepPersonal
 *
 * Renders a form section stub for Step 1 (personal info).
 */
import React from "react";

export const StepPersonal = jest.fn(() =>
  React.createElement("div", { "data-testid": "step-personal" }, "StepPersonal"),
);
