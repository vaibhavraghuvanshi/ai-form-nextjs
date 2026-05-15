import {
  valueTrim,
  lettersOnlyPattern,
  nationalIdAlnumPattern,
  phonePattern,
  emailPattern,
  SITUATION_FIELD_MIN_LENGTH,
  applicationPayloadSchema,
} from "@/lib/application-validation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const longEnough = "A".repeat(SITUATION_FIELD_MIN_LENGTH);

const validPayload = {
  name: "John Doe",
  nationalId: "ABC1234",
  dateOfBirth: "1990-01-01",
  gender: "male",
  address: "123 Main Street",
  city: "London",
  state: "England",
  country: "United",
  phone: "+44 1234 5678",
  email: "john@example.com",
  maritalStatus: "single",
  dependents: "0",
  employmentStatus: "employed",
  monthlyIncome: "3000",
  housingStatus: "rent",
  financialSituation: longEnough,
  employmentCircumstances: longEnough,
  reasonForApplying: longEnough,
};

// ---------------------------------------------------------------------------
// valueTrim
// ---------------------------------------------------------------------------
describe("valueTrim", () => {
  it("trims leading and trailing whitespace from strings", () => {
    expect(valueTrim("  hello  ")).toBe("hello");
  });

  it("returns an empty string for numbers", () => {
    expect(valueTrim(42)).toBe("");
  });

  it("returns an empty string for null", () => {
    expect(valueTrim(null)).toBe("");
  });

  it("returns an empty string for undefined", () => {
    expect(valueTrim(undefined)).toBe("");
  });

  it("returns an empty string for objects", () => {
    expect(valueTrim({})).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Regex patterns
// ---------------------------------------------------------------------------
describe("lettersOnlyPattern", () => {
  it.each(["John", "John Doe", "Ángel", "محمد"])("accepts: %s", (v) => {
    expect(lettersOnlyPattern.test(v)).toBe(true);
  });

  it.each(["John123", "John_Doe", "123"])("rejects: %s", (v) => {
    expect(lettersOnlyPattern.test(v)).toBe(false);
  });
});

describe("nationalIdAlnumPattern", () => {
  it.each(["ABC123", "12345678", "X1"])("accepts: %s", (v) => {
    expect(nationalIdAlnumPattern.test(v)).toBe(true);
  });

  it.each(["ABC-123", "AB CD", ""])("rejects: %s", (v) => {
    expect(nationalIdAlnumPattern.test(v)).toBe(false);
  });
});

describe("phonePattern", () => {
  it.each(["+44 1234 5678", "01234567890", "(555) 123-4567"])("accepts: %s", (v) => {
    expect(phonePattern.test(v)).toBe(true);
  });

  it.each(["short", "123"])("rejects: %s", (v) => {
    expect(phonePattern.test(v)).toBe(false);
  });
});

describe("emailPattern", () => {
  it.each(["user@example.com", "a.b+c@sub.domain.org"])("accepts: %s", (v) => {
    expect(emailPattern.test(v)).toBe(true);
  });

  it.each(["notanemail", "@nodomain", "user@", "user @example.com"])("rejects: %s", (v) => {
    expect(emailPattern.test(v)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// applicationPayloadSchema
// ---------------------------------------------------------------------------
describe("applicationPayloadSchema – valid payload", () => {
  it("accepts a complete valid payload", () => {
    expect(applicationPayloadSchema.safeParse(validPayload).success).toBe(true);
  });

  it("trims whitespace in string fields", () => {
    const result = applicationPayloadSchema.safeParse({
      ...validPayload,
      name: "  John Doe  ",
    });
    expect(result.success).toBe(true);
  });
});

describe("applicationPayloadSchema – name", () => {
  it("rejects empty name", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, name: "" }).success).toBe(false);
  });

  it("rejects name with digits", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, name: "John1" }).success).toBe(false);
  });

  it("rejects name with symbols", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, name: "John@Doe" }).success).toBe(false);
  });
});

describe("applicationPayloadSchema – nationalId", () => {
  it("rejects nationalId shorter than 4 chars", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, nationalId: "AB1" }).success).toBe(false);
  });

  it("rejects nationalId with hyphens", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, nationalId: "AB-123" }).success).toBe(false);
  });
});

describe("applicationPayloadSchema – gender", () => {
  it.each(["male", "female", "other", "prefer_not"])("accepts gender: %s", (gender) => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, gender }).success).toBe(true);
  });

  it("rejects unknown gender value", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, gender: "unknown" }).success).toBe(false);
  });
});

describe("applicationPayloadSchema – phone", () => {
  it("rejects phone shorter than 8 chars", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, phone: "1234" }).success).toBe(false);
  });

  it("rejects phone with letters", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, phone: "phone_num" }).success).toBe(false);
  });
});

describe("applicationPayloadSchema – email", () => {
  it("rejects invalid email format", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, email: "not-an-email" }).success).toBe(false);
  });
});

describe("applicationPayloadSchema – maritalStatus", () => {
  it.each(["single", "married", "divorced", "widowed", "partnered"])("accepts: %s", (v) => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, maritalStatus: v }).success).toBe(true);
  });

  it("rejects unknown marital status", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, maritalStatus: "other" }).success).toBe(false);
  });
});

describe("applicationPayloadSchema – dependents", () => {
  it("accepts '0'", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, dependents: "0" }).success).toBe(true);
  });

  it("accepts '30' (max)", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, dependents: "30" }).success).toBe(true);
  });

  it("rejects non-numeric string", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, dependents: "abc" }).success).toBe(false);
  });

  it("rejects negative number", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, dependents: "-1" }).success).toBe(false);
  });

  it("rejects value above 30", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, dependents: "31" }).success).toBe(false);
  });

  it("rejects float", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, dependents: "1.5" }).success).toBe(false);
  });
});

describe("applicationPayloadSchema – employmentStatus", () => {
  it.each(["employed", "self_employed", "unemployed", "student", "retired", "other"])("accepts: %s", (v) => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, employmentStatus: v }).success).toBe(true);
  });

  it("rejects unknown employment status", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, employmentStatus: "freelance" }).success).toBe(false);
  });
});

describe("applicationPayloadSchema – housingStatus", () => {
  it.each(["own", "rent", "shared", "temporary", "other"])("accepts: %s", (v) => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, housingStatus: v }).success).toBe(true);
  });

  it("rejects unknown housing status", () => {
    expect(applicationPayloadSchema.safeParse({ ...validPayload, housingStatus: "unknown" }).success).toBe(false);
  });
});

describe("applicationPayloadSchema – situation fields (min length)", () => {
  const shortText = "A".repeat(SITUATION_FIELD_MIN_LENGTH - 1);

  it("rejects financialSituation below min length", () => {
    expect(
      applicationPayloadSchema.safeParse({ ...validPayload, financialSituation: shortText }).success,
    ).toBe(false);
  });

  it("rejects employmentCircumstances below min length", () => {
    expect(
      applicationPayloadSchema.safeParse({ ...validPayload, employmentCircumstances: shortText }).success,
    ).toBe(false);
  });

  it("rejects reasonForApplying below min length", () => {
    expect(
      applicationPayloadSchema.safeParse({ ...validPayload, reasonForApplying: shortText }).success,
    ).toBe(false);
  });
});

describe("applicationPayloadSchema – strict mode (no extra keys)", () => {
  it("rejects payloads with extra unknown keys", () => {
    expect(
      applicationPayloadSchema.safeParse({ ...validPayload, extraField: "oops" }).success,
    ).toBe(false);
  });
});

describe("SITUATION_FIELD_MIN_LENGTH", () => {
  it("is a positive number", () => {
    expect(SITUATION_FIELD_MIN_LENGTH).toBeGreaterThan(0);
  });
});
