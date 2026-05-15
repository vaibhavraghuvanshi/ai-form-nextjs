/**
 * Mock for @/types/application
 *
 * Re-exports the real types and constants so tests can import them without
 * side effects. No runtime logic is mocked here — types are structural only.
 */
export type {
  ApplicationFormValues,
  SituationFieldKey,
} from "@/types/application";

export {
  STORAGE_KEY,
  defaultFormValues,
} from "@/types/application";
