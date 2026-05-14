"use client";

import {
  Building2,
  Calendar,
  Globe,
  IdCard,
  Mail,
  Map,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import {
  emailPattern,
  lettersOnlyPattern,
  nationalIdAlnumPattern,
  phonePattern,
  valueTrim as trim,
} from "@/lib/application-validation";
import type { ApplicationFormValues } from "@/types/application";
import { FormField, formControlClass } from "./FormField";

export function StepPersonal() {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  return (
    <fieldset className="space-y-1">
      <legend className="sr-only">{t("steps.personalTitle")}</legend>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-app-text sm:text-xl">
          {t("steps.personalTitle")}
        </h2>
        <p className="mt-1 text-sm text-app-muted">{t("wizard.subtitlePersonal")}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-5 md:gap-y-5">
        <FormField
          id="name"
          label={t("fields.name")}
          required
          icon={User}
          error={errors.name?.message}
          className="md:col-span-2"
        >
          <input
            id="name"
            autoComplete="name"
            className={formControlClass}
            placeholder={t("fields.placeholderName")}
            {...register("name", {
              required: t("validation.required"),
              setValueAs: trim,
              pattern: {
                value: lettersOnlyPattern,
                message: t("validation.lettersOnly"),
              },
            })}
            aria-invalid={errors.name ? "true" : "false"}
          />
        </FormField>

        <FormField
          id="nationalId"
          label={t("fields.nationalId")}
          required
          icon={IdCard}
          error={errors.nationalId?.message}
        >
          <input
            id="nationalId"
            className={formControlClass}
            placeholder={t("fields.placeholderNationalId")}
            {...register("nationalId", {
              required: t("validation.required"),
              setValueAs: trim,
              minLength: { value: 4, message: t("validation.nationalIdMin") },
              pattern: {
                value: nationalIdAlnumPattern,
                message: t("validation.nationalIdFormat"),
              },
            })}
            aria-invalid={errors.nationalId ? "true" : "false"}
          />
        </FormField>

        <FormField
          id="dateOfBirth"
          label={t("fields.dateOfBirth")}
          required
          icon={Calendar}
          error={errors.dateOfBirth?.message}
        >
          <input
            id="dateOfBirth"
            type="date"
            className={`${formControlClass} text-app-muted focus:text-app-text`}
            {...register("dateOfBirth", { required: t("validation.required") })}
            aria-invalid={errors.dateOfBirth ? "true" : "false"}
          />
        </FormField>

        <FormField
          id="gender"
          label={t("fields.gender")}
          required
          icon={Users}
          error={errors.gender?.message}
        >
          <select
            id="gender"
            className={`${formControlClass} cursor-pointer`}
            {...register("gender", { required: t("validation.required") })}
            aria-invalid={errors.gender ? "true" : "false"}
          >
            <option value="" disabled>
              {t("fields.selectPlaceholder")}
            </option>
            <option value="male">{t("fields.genderMale")}</option>
            <option value="female">{t("fields.genderFemale")}</option>
            <option value="other">{t("fields.genderOther")}</option>
            <option value="prefer_not">{t("fields.genderPreferNot")}</option>
          </select>
        </FormField>

        <FormField
          id="address"
          label={t("fields.address")}
          required
          icon={MapPin}
          error={errors.address?.message}
          className="md:col-span-2"
        >
          <input
            id="address"
            autoComplete="street-address"
            className={formControlClass}
            placeholder={t("fields.placeholderAddress")}
            {...register("address", { required: t("validation.required") })}
            aria-invalid={errors.address ? "true" : "false"}
          />
        </FormField>

        <FormField
          id="city"
          label={t("fields.city")}
          required
          icon={Building2}
          error={errors.city?.message}
        >
          <input
            id="city"
            autoComplete="address-level2"
            className={formControlClass}
            placeholder={t("fields.placeholderCity")}
            {...register("city", {
              required: t("validation.required"),
              setValueAs: trim,
              pattern: {
                value: lettersOnlyPattern,
                message: t("validation.lettersOnly"),
              },
            })}
            aria-invalid={errors.city ? "true" : "false"}
          />
        </FormField>

        <FormField
          id="state"
          label={t("fields.state")}
          required
          icon={Map}
          error={errors.state?.message}
        >
          <input
            id="state"
            autoComplete="address-level1"
            className={formControlClass}
            placeholder={t("fields.placeholderState")}
            {...register("state", {
              required: t("validation.required"),
              setValueAs: trim,
              pattern: {
                value: lettersOnlyPattern,
                message: t("validation.lettersOnly"),
              },
            })}
            aria-invalid={errors.state ? "true" : "false"}
          />
        </FormField>

        <FormField
          id="country"
          label={t("fields.country")}
          required
          icon={Globe}
          error={errors.country?.message}
        >
          <input
            id="country"
            autoComplete="country-name"
            className={formControlClass}
            placeholder={t("fields.placeholderCountry")}
            {...register("country", {
              required: t("validation.required"),
              setValueAs: trim,
              pattern: {
                value: lettersOnlyPattern,
                message: t("validation.lettersOnly"),
              },
            })}
            aria-invalid={errors.country ? "true" : "false"}
          />
        </FormField>

        <FormField
          id="phone"
          label={t("fields.phone")}
          required
          icon={Phone}
          error={errors.phone?.message}
        >
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className={formControlClass}
            placeholder={t("fields.placeholderPhone")}
            {...register("phone", {
              required: t("validation.required"),
              pattern: {
                value: phonePattern,
                message: t("validation.phone"),
              },
            })}
            aria-invalid={errors.phone ? "true" : "false"}
          />
        </FormField>

        <FormField
          id="email"
          label={t("fields.email")}
          required
          icon={Mail}
          error={errors.email?.message}
          className="md:col-span-2"
        >
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={formControlClass}
            placeholder={t("fields.placeholderEmail")}
            {...register("email", {
              required: t("validation.required"),
              pattern: {
                value: emailPattern,
                message: t("validation.email"),
              },
            })}
            aria-invalid={errors.email ? "true" : "false"}
          />
        </FormField>
      </div>
    </fieldset>
  );
}
