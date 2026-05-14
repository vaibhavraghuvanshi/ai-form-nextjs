import { z } from "zod";

/** Letters in any script, words separated by spaces; no digits or symbols */
export const lettersOnlyPattern = /^[\p{L}]+(?:\s+[\p{L}]+)*$/u;

/** Letters and numbers in any script; no spaces or symbols */
export const nationalIdAlnumPattern = /^[\p{L}\p{N}]+$/u;

export const phonePattern = /^[0-9+\s().-]{8,}$/;

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SITUATION_FIELD_MIN_LENGTH = 24;

export function valueTrim(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

const letters = z.string().trim().min(1).regex(lettersOnlyPattern);

export const applicationPayloadSchema = z
  .object({
    name: letters,
    nationalId: z
      .string()
      .trim()
      .min(4)
      .regex(nationalIdAlnumPattern),
    dateOfBirth: z.string().trim().min(1),
    gender: z.enum(["male", "female", "other", "prefer_not"]),
    address: z.string().trim().min(1),
    city: letters,
    state: letters,
    country: letters,
    phone: z.string().trim().min(1).regex(phonePattern),
    email: z.string().trim().min(1).regex(emailPattern),

    maritalStatus: z.enum(["single", "married", "divorced", "widowed", "partnered"]),
    dependents: z
      .string()
      .trim()
      .min(1)
      .refine((v) => {
        const n = Number(v);
        return !Number.isNaN(n) && Number.isInteger(n) && n >= 0 && n <= 30;
      }),
    employmentStatus: z.enum([
      "employed",
      "self_employed",
      "unemployed",
      "student",
      "retired",
      "other",
    ]),
    monthlyIncome: z.string().trim().min(1),
    housingStatus: z.enum(["own", "rent", "shared", "temporary", "other"]),

    financialSituation: z.string().trim().min(SITUATION_FIELD_MIN_LENGTH),
    employmentCircumstances: z.string().trim().min(SITUATION_FIELD_MIN_LENGTH),
    reasonForApplying: z.string().trim().min(SITUATION_FIELD_MIN_LENGTH),
  })
  .strict();

export type ApplicationPayload = z.infer<typeof applicationPayloadSchema>;
