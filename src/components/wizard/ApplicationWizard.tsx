"use client";

import axios from "axios";
import Lottie from "lottie-react";
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Globe,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { FormProvider, type Path, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import thanksAnimation from "@/Thanks.json";
import { useLanguage } from "@/components/providers/AppProviders";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft-storage";
import {
  type ApplicationFormValues,
  type SituationFieldKey,
  defaultFormValues,
} from "@/types/application";
import { AiSuggestionDialog } from "./AiSuggestionDialog";
import { ProgressBar } from "./ProgressBar";
import { StepFamily } from "./StepFamily";
import { StepPersonal } from "./StepPersonal";
import { StepSituation } from "./StepSituation";

const STEP1_FIELDS = [
  "name",
  "nationalId",
  "dateOfBirth",
  "gender",
  "address",
  "city",
  "state",
  "country",
  "phone",
  "email",
] as const satisfies readonly Path<ApplicationFormValues>[];

const STEP2_FIELDS = [
  "maritalStatus",
  "dependents",
  "employmentStatus",
  "monthlyIncome",
  "housingStatus",
] as const satisfies readonly Path<ApplicationFormValues>[];

const STEP3_FIELDS = [
  "financialSituation",
  "employmentCircumstances",
  "reasonForApplying",
] as const satisfies readonly Path<ApplicationFormValues>[];

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-app-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-app-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-primary disabled:cursor-not-allowed disabled:opacity-60";

const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-app-border bg-app-surface px-4 py-2.5 text-sm font-medium text-app-text shadow-sm transition-colors hover:bg-app-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-primary disabled:cursor-not-allowed disabled:opacity-60";

export function ApplicationWizard() {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { language, setLanguage } = useLanguage();
  const [step, setStep] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSaveTs, setLastSaveTs] = useState<number | null>(null);

  const form = useForm<ApplicationFormValues>({
    defaultValues: defaultFormValues,
    mode: "onBlur",
  });

  const {
    handleSubmit,
    reset,
    setValue,
    trigger,
    getValues,
    control,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      reset(draft.values);
      setStep(draft.step);
    }
    setHydrated(true);
  }, [reset]);

  const watched = useWatch({ control });

  useEffect(() => {
    if (!hydrated) return;
    const handle = window.setTimeout(() => {
      saveDraft({ step, values: { ...defaultFormValues, ...watched } });
      setLastSaveTs(Date.now());
    }, 350);
    return () => window.clearTimeout(handle);
  }, [watched, step, hydrated]);

  const showJustNow = lastSaveTs != null && Date.now() - lastSaveTs < 30_000;

  const manualSaveDraft = useCallback(() => {
    saveDraft({ step, values: getValues() });
    setLastSaveTs(Date.now());
  }, [getValues, step]);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiField, setAiField] = useState<SituationFieldKey | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiEditMode, setAiEditMode] = useState(false);
  const [aiDraftText, setAiDraftText] = useState("");

  const closeAi = useCallback(() => {
    setAiOpen(false);
    setAiField(null);
    setAiLoading(false);
    setAiError(null);
    setAiSuggestion(null);
    setAiEditMode(false);
    setAiDraftText("");
  }, []);

  const onHelpWrite = useCallback(
    async (field: SituationFieldKey) => {
      setAiField(field);
      setAiOpen(true);
      setAiLoading(true);
      setAiError(null);
      setAiSuggestion(null);
      setAiEditMode(false);
      setAiDraftText("");

      const v = getValues();
      try {
        const res = await axios.post<{ suggestion?: string; error?: string }>(
          "/api/compose",
          {
            fieldKey: field,
            language,
            hints: {
              employmentStatus: v.employmentStatus,
              monthlyIncome: v.monthlyIncome,
              housingStatus: v.housingStatus,
              maritalStatus: v.maritalStatus,
            },
          },
          { timeout: 55_000 },
        );
        const text = res.data?.suggestion?.trim();
        if (!text) {
          setAiError(t("ai.errorGeneric"));
        } else {
          setAiSuggestion(text);
          setAiDraftText(text);
        }
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const status = e.response?.status;
          const data = e.response?.data as { error?: string } | undefined;
          const errMsg = data?.error;
          if (
            status === 503 ||
            errMsg === "missing_api_key" ||
            errMsg === "OPENAI_API_KEY is not configured"
          ) {
            setAiError(t("ai.errorConfig"));
          } else if (
            status === 504 ||
            errMsg === "timeout" ||
            e.code === "ECONNABORTED"
          ) {
            setAiError(t("ai.errorTimeout"));
          } else if (status === 401 || errMsg === "invalid_api_key") {
            setAiError(t("ai.errorInvalidKey"));
          } else if (status === 429) {
            if (errMsg === "insufficient_quota") {
              setAiError(t("ai.errorQuota"));
            } else {
              setAiError(t("ai.errorRateLimit"));
            }
          } else {
            setAiError(t("ai.errorGeneric"));
          }
        } else {
          setAiError(t("ai.errorGeneric"));
        }
      } finally {
        setAiLoading(false);
      }
    },
    [getValues, language, t],
  );

  const onAcceptSuggestion = useCallback(() => {
    if (aiField && aiSuggestion) {
      setValue(aiField, aiSuggestion, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    closeAi();
  }, [aiField, aiSuggestion, closeAi, setValue]);

  const onConfirmEdited = useCallback(() => {
    if (aiField) {
      setValue(aiField, aiDraftText, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    closeAi();
  }, [aiDraftText, aiField, closeAi, setValue]);

  const goNext = useCallback(async () => {
    const fields =
      step === 1 ? STEP1_FIELDS : step === 2 ? STEP2_FIELDS : STEP3_FIELDS;
    const ok = await trigger([...fields], { shouldFocus: true });
    if (!ok) return;
    setStep((s) => Math.min(3, s + 1));
  }, [step, trigger]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const onFinalSubmit = handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      const res = await axios.post<{ reference?: string }>(
        "/api/submit",
        data,
        { timeout: 20_000 },
      );
      clearDraft();
      const ref = res.data?.reference?.trim();
      setSubmittedRef(
        ref && ref.length > 0
          ? ref
          : `SSP-${new Date().getUTCFullYear()}-${Date.now().toString(36).toUpperCase().slice(-8)}`,
      );
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        const data = e.response?.data as { error?: string } | undefined;
        if (status === 400 && data?.error === "validation_failed") {
          setSubmitError(t("wizard.submitValidationFailed"));
          return;
        }
      }
      setSubmitError(t("ai.errorGeneric"));
    }
  });

  const startOver = useCallback(() => {
    clearDraft();
    reset(defaultFormValues);
    setStep(1);
    setSubmittedRef(null);
    setSubmitError(null);
  }, [reset]);

  const aiTitle = useMemo(() => {
    if (!aiField) return t("ai.dialogTitle");
    if (aiField === "financialSituation") return t("fields.financialSituation");
    if (aiField === "employmentCircumstances") {
      return t("fields.employmentCircumstances");
    }
    return t("fields.reasonForApplying");
  }, [aiField, t]);

  if (submittedRef) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-app-border bg-app-surface p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex justify-center" aria-hidden="true">
          {prefersReducedMotion ? (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-app-info-bg text-app-primary">
              <ShieldCheck className="h-12 w-12" strokeWidth={1.75} />
            </div>
          ) : (
            <div className="h-32 w-32 sm:h-36 sm:w-36">
              <Lottie
                animationData={thanksAnimation}
                loop={false}
                className="h-full w-full"
              />
            </div>
          )}
        </div>
        <h1 className="text-xl font-semibold text-app-text">
          {t("wizard.submittedTitle")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-app-muted">
          {t("wizard.submittedBody")}
        </p>
        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-app-muted">
          {t("wizard.submittedReferenceLabel")}
        </p>
        <p className="mt-1 font-mono text-sm font-semibold text-app-text">
          {submittedRef}
        </p>
        <button
          type="button"
          className={`${primaryBtn} mt-6`}
          onClick={startOver}
        >
          {t("wizard.newApplication")}
        </button>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-app-info-bg text-app-primary">
              <ShieldCheck className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-app-text sm:text-[1.5rem]">
                {t("app.title")}
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-app-muted">
                {t("app.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start sm:justify-end">
            <label
              htmlFor="app-language"
              className="relative inline-flex min-w-42 cursor-pointer items-center rounded-lg border border-app-border bg-app-surface py-2 ps-3 pe-8 shadow-sm focus-within:border-app-primary focus-within:ring-2 focus-within:ring-app-primary/20"
            >
              <Globe
                className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted"
                strokeWidth={2}
                aria-hidden
              />
              <select
                id="app-language"
                value={language}
                aria-label={t("lang.toggle")}
                onChange={(e) =>
                  setLanguage(e.target.value === "ar" ? "ar" : "en")
                }
                className="w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent py-0 ps-7 pe-1 text-sm font-medium text-app-text outline-none"
              >
                <option value="en">{t("lang.en")}</option>
                <option value="ar">{t("lang.ar")}</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute inset-e-2 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted"
                strokeWidth={2}
                aria-hidden
              />
            </label>
          </div>
        </header>

        <div
          className="relative rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm sm:p-8"
          aria-busy={isSubmitting}
        >
          <ProgressBar currentStep={step} />
          <div className="mt-8 border-b border-app-border pb-8">
            {step === 1 && <StepPersonal />}
            {step === 2 && <StepFamily />}
            {step === 3 && (
              <StepSituation
                onHelpWrite={onHelpWrite}
                busyField={aiLoading && aiField ? aiField : null}
              />
            )}
          </div>

          <div
            className="mt-8 flex gap-3 rounded-lg border border-app-primary/10 bg-app-info-bg px-4 py-3"
            role="note"
          >
            <Shield
              className="mt-0.5 h-5 w-5 shrink-0 text-app-primary"
              aria-hidden
            />
            <p className="text-sm leading-relaxed text-app-text">
              {t("wizard.privacyNotice")}
            </p>
          </div>

          {submitError ? (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-4 border-t border-app-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <button
                type="button"
                className={secondaryBtn}
                onClick={manualSaveDraft}
                disabled={isSubmitting}
              >
                <Bookmark
                  className="h-4 w-4 text-app-primary"
                  strokeWidth={2}
                  aria-hidden
                />
                {t("wizard.saveDraft")}
              </button>
              <div className="flex items-center gap-2 text-sm text-app-muted">
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-app-success"
                  strokeWidth={2}
                  aria-hidden
                />
                <span>{t("wizard.saving")}</span>
                {showJustNow ? (
                  <span className="font-medium text-app-success">
                    — {t("wizard.justNow")}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {step > 1 ? (
                <button
                  type="button"
                  className={secondaryBtn}
                  onClick={goBack}
                  disabled={isSubmitting}
                >
                  {t("wizard.back")}
                </button>
              ) : null}
              {step < 3 ? (
                <button
                  type="button"
                  className={primaryBtn}
                  onClick={() => void goNext()}
                  disabled={isSubmitting}
                >
                  {t("wizard.next")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              ) : (
                <button
                  type="button"
                  className={primaryBtn}
                  onClick={() => void onFinalSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("wizard.submitting") : t("wizard.submit")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AiSuggestionDialog
        open={aiOpen}
        title={aiTitle}
        loading={aiLoading}
        error={aiError}
        suggestion={aiSuggestion}
        editMode={aiEditMode}
        draftText={aiDraftText}
        onClose={closeAi}
        onAccept={onAcceptSuggestion}
        onStartEdit={() => setAiEditMode(true)}
        onDiscard={closeAi}
        onChangeDraft={setAiDraftText}
        onConfirmEdit={onConfirmEdited}
      />
    </FormProvider>
  );
}
