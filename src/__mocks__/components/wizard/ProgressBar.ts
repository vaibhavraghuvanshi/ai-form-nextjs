/**
 * Mock for @/components/wizard/ProgressBar
 *
 * Renders a lightweight stub showing the current step.
 * Override per-test if visual assertions on the bar are needed.
 */
import React from "react";

export const ProgressBar = jest.fn(
  ({ step, totalSteps }: { step: number; totalSteps: number }) =>
    React.createElement(
      "div",
      { "data-testid": "progress-bar", "data-step": step, "data-total": totalSteps },
      `Step ${step} of ${totalSteps}`,
    ),
);
