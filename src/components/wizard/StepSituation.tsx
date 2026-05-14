"use client";

import { AlignLeft, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { SITUATION_FIELD_MIN_LENGTH } from "@/lib/application-validation";
import type {
  ApplicationFormValues,
  SituationFieldKey,
} from "@/types/application";
import { FormField } from "./FormField";

const textareaClass =
  "min-h-[8rem] w-full resize-y border-0 bg-transparent px-3 py-3 text-sm text-app-text outline-none placeholder:text-slate-400";

function SituationBlock({
  id,
  field,
  label,
  onHelpWrite,
  disabled,
}: {
  id: string;
  field: SituationFieldKey;
  label: string;
  onHelpWrite: (field: SituationFieldKey) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationFormValues>();

  const error = errors[field];

  return (
    <div className="space-y-2">
      <FormField
        id={id}
        label={label}
        required
        icon={AlignLeft}
        error={error?.message}
        iconTop
        labelAction={
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-app-primary/30 bg-app-info-bg px-3 py-1.5 text-xs font-semibold text-app-primary hover:border-app-primary hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-primary disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onHelpWrite(field)}
            disabled={disabled}
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {t("ai.helpWrite")}
          </button>
        }
      >
        <textarea
          id={id}
          rows={5}
          className={textareaClass}
          {...register(field, {
            required: t("validation.required"),
            minLength: {
              value: SITUATION_FIELD_MIN_LENGTH,
              message: t("validation.minText", {
                min: SITUATION_FIELD_MIN_LENGTH,
              }),
            },
          })}
          placeholder={t("fields.placeholderTextarea")}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={`${id}-hint`}
        />
      </FormField>
      <p id={`${id}-hint`} className="text-xs text-app-muted">
        {t("validation.minText", { min: SITUATION_FIELD_MIN_LENGTH })}
      </p>
    </div>
  );
}

type Props = {
  onHelpWrite: (field: SituationFieldKey) => void;
  busyField: SituationFieldKey | null;
};

export function StepSituation({ onHelpWrite, busyField }: Props) {
  const { t } = useTranslation();

  return (
    <fieldset className="space-y-8">
      <legend className="sr-only">{t("steps.situationTitle")}</legend>
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-app-text sm:text-xl">
          {t("steps.situationTitle")}
        </h2>
        <p className="mt-1 text-sm text-app-muted">
          {t("wizard.subtitleSituation")}
        </p>
      </div>

      <SituationBlock
        id="financialSituation"
        field="financialSituation"
        label={t("fields.financialSituation")}
        onHelpWrite={onHelpWrite}
        disabled={busyField === "financialSituation"}
      />
      <SituationBlock
        id="employmentCircumstances"
        field="employmentCircumstances"
        label={t("fields.employmentCircumstances")}
        onHelpWrite={onHelpWrite}
        disabled={busyField === "employmentCircumstances"}
      />
      <SituationBlock
        id="reasonForApplying"
        field="reasonForApplying"
        label={t("fields.reasonForApplying")}
        onHelpWrite={onHelpWrite}
        disabled={busyField === "reasonForApplying"}
      />
    </fieldset>
  );
}
