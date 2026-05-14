import type { ApplicationFormValues } from "@/types/application";
import { STORAGE_KEY, defaultFormValues } from "@/types/application";

export type DraftPayload = {
  step: number;
  values: ApplicationFormValues;
};

export function loadDraft(): DraftPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DraftPayload>;
    if (!parsed || typeof parsed.step !== "number" || !parsed.values) {
      return null;
    }
    return {
      step: Math.min(3, Math.max(1, parsed.step)),
      values: { ...defaultFormValues, ...parsed.values },
    };
  } catch {
    return null;
  }
}

export function saveDraft(payload: DraftPayload) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota or private mode */
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
