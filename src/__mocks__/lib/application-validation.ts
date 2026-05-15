/**
 * Mock for @/lib/application-validation
 *
 * Returns a stub schema that always passes validation in unit tests.
 * Import and override safeParseResult per-test to simulate validation failures.
 */
import type { ApplicationFormValues } from "@/types/application";

const safeParse = jest.fn((data: unknown) => ({
  success: true as const,
  data: data as ApplicationFormValues,
}));

export const applicationPayloadSchema = {
  safeParse,
  parse: jest.fn((data: unknown) => data as ApplicationFormValues),
};
