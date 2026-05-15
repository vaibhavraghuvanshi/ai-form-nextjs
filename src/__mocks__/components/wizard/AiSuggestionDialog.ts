/**
 * Mock for @/components/wizard/AiSuggestionDialog
 *
 * Renders a dialog stub. The `open` prop controls visibility via data attribute.
 * Override per-test to simulate dialog open/close states.
 */
import React from "react";
import type { SituationFieldKey } from "@/types/application";

type Props = {
  open: boolean;
  fieldKey: SituationFieldKey;
  onClose: () => void;
  onApply: (text: string) => void;
};

export const AiSuggestionDialog = jest.fn(({ open, fieldKey }: Props) =>
  React.createElement(
    "div",
    { "data-testid": "ai-suggestion-dialog", "data-open": String(open), "data-field": fieldKey },
    open ? "AiSuggestionDialog" : null,
  ),
);
