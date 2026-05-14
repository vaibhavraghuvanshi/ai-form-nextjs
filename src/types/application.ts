export type SituationFieldKey =
  | "financialSituation"
  | "employmentCircumstances"
  | "reasonForApplying";

export type ApplicationFormValues = {
  name: string;
  nationalId: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  maritalStatus: string;
  dependents: string;
  employmentStatus: string;
  monthlyIncome: string;
  housingStatus: string;
  financialSituation: string;
  employmentCircumstances: string;
  reasonForApplying: string;
};

export const STORAGE_KEY = "social-support-application-draft";

export const defaultFormValues: ApplicationFormValues = {
  name: "",
  nationalId: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  country: "",
  phone: "",
  email: "",
  maritalStatus: "",
  dependents: "0",
  employmentStatus: "",
  monthlyIncome: "",
  housingStatus: "",
  financialSituation: "",
  employmentCircumstances: "",
  reasonForApplying: "",
};
