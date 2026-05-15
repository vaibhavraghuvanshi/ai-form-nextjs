/**
 * Mock for @/lib/draft-storage
 *
 * All storage functions are jest.fn() stubs.
 * Override per-test:
 *   import { loadDraft } from '@/lib/draft-storage';
 *   (loadDraft as jest.Mock).mockReturnValue({ step: 2, values: { ... } });
 */
import type { DraftPayload } from "@/lib/draft-storage";

export const loadDraft = jest.fn((): DraftPayload | null => null);
export const saveDraft = jest.fn((_payload: DraftPayload): void => undefined);
export const clearDraft = jest.fn((): void => undefined);
