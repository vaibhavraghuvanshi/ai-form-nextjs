/**
 * Mock for @/components/wizard/StepSituation
 *
 * Renders a form section stub for Step 3 (situation text fields).
 */
import React from "react";

export const StepSituation = jest.fn(() =>
  React.createElement("div", { "data-testid": "step-situation" }, "StepSituation"),
);
