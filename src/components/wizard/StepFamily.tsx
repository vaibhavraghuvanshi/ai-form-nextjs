"use client";

import { Banknote, Briefcase, Heart, Home, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import type { ApplicationFormValues } from "@/types/application";
import { FormField, formControlClass } from "./FormField";

export function StepFamily() {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  return (
    <fieldset className="space-y-1">
      <legend className="sr-only">{t("steps.familyTitle")}</legend>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-app-text sm:text-xl">
          {t("steps.familyTitle")}
        </h2>
        <p className="mt-1 text-sm text-app-muted">{t("wizard.subtitleFamily")}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField
          id="maritalStatus"
          label={t("fields.maritalStatus")}
          required
          icon={Heart}
          error={errors.maritalStatus?.message}
        >
          <select
            id="maritalStatus"
            className={`${formControlClass} cursor-pointer`}
            {...register("maritalStatus", { required: t("validation.required") })}
            aria-invalid={errors.maritalStatus ? "true" : "false"}
          >
            <option value="" disabled>
              {t("fields.selectPlaceholder")}
            </option>
            <option value="single">{t("fields.maritalSingle")}</option>
            <option value="married">{t("fields.maritalMarried")}</option>
            <option value="divorced">{t("fields.maritalDivorced")}</option>
            <option value="widowed">{t("fields.maritalWidowed")}</option>
            <option value="partnered">{t("fields.maritalPartnered")}</option>
          </select>
        </FormField>

        <FormField
          id="dependents"
          label={t("fields.dependents")}
          required
          icon={Users}
          error={errors.dependents?.message}
        >
          <input
            id="dependents"
            type="number"
            min={0}
            max={30}
            inputMode="numeric"
            className={formControlClass}
            {...register("dependents", {
              required: t("validation.required"),
              validate: (v) => {
                const n = Number(v);
                if (Number.isNaN(n) || v === "") return t("validation.required");
                if (n < 0) return t("validation.dependentsMin");
                if (n > 30) return t("validation.dependentsMax");
                return true;
              },
            })}
            aria-invalid={errors.dependents ? "true" : "false"}
          />
        </FormField>

        <FormField
          id="employmentStatus"
          label={t("fields.employmentStatus")}
          required
          icon={Briefcase}
          error={errors.employmentStatus?.message}
        >
          <select
            id="employmentStatus"
            className={`${formControlClass} cursor-pointer`}
            {...register("employmentStatus", { required: t("validation.required") })}
            aria-invalid={errors.employmentStatus ? "true" : "false"}
          >
            <option value="" disabled>
              {t("fields.selectPlaceholder")}
            </option>
            <option value="employed">{t("fields.employmentEmployed")}</option>
            <option value="self_employed">{t("fields.employmentSelf")}</option>
            <option value="unemployed">{t("fields.employmentUnemployed")}</option>
            <option value="student">{t("fields.employmentStudent")}</option>
            <option value="retired">{t("fields.employmentRetired")}</option>
            <option value="other">{t("fields.employmentOther")}</option>
          </select>
        </FormField>

        <FormField
          id="monthlyIncome"
          label={t("fields.monthlyIncome")}
          required
          icon={Banknote}
          error={errors.monthlyIncome?.message}
        >
          <input
            id="monthlyIncome"
            inputMode="decimal"
            className={formControlClass}
            placeholder="0"
            {...register("monthlyIncome", { required: t("validation.required") })}
            aria-invalid={errors.monthlyIncome ? "true" : "false"}
          />
        </FormField>

        <FormField
          id="housingStatus"
          label={t("fields.housingStatus")}
          required
          icon={Home}
          error={errors.housingStatus?.message}
          className="md:col-span-2"
        >
          <select
            id="housingStatus"
            className={`${formControlClass} cursor-pointer`}
            {...register("housingStatus", { required: t("validation.required") })}
            aria-invalid={errors.housingStatus ? "true" : "false"}
          >
            <option value="" disabled>
              {t("fields.selectPlaceholder")}
            </option>
            <option value="own">{t("fields.housingOwn")}</option>
            <option value="rent">{t("fields.housingRent")}</option>
            <option value="shared">{t("fields.housingShared")}</option>
            <option value="temporary">{t("fields.housingTemporary")}</option>
            <option value="other">{t("fields.housingOther")}</option>
          </select>
        </FormField>
      </div>
    </fieldset>
  );
}
