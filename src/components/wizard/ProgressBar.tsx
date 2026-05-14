"use client";

import { Fragment } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  currentStep: number;
  totalSteps?: number;
};

export function ProgressBar({ currentStep, totalSteps = 3 }: Props) {
  const { t } = useTranslation();

  const steps = [
    { n: 1, label: t("wizard.step1") },
    { n: 2, label: t("wizard.step2") },
    { n: 3, label: t("wizard.step3") },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <span
          id="wizard-progress-label"
          className="text-sm font-medium text-app-muted"
        >
          {t("wizard.progressLabel")}
        </span>
        <span className="text-sm font-medium text-app-muted" aria-live="polite">
          {t("wizard.stepOf", { current: currentStep, total: totalSteps })}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep}
        aria-valuetext={t("wizard.stepOf", {
          current: currentStep,
          total: totalSteps,
        })}
        aria-labelledby="wizard-progress-label"
      >
        <div className="flex w-full items-center gap-1 sm:gap-2">
          {steps.map(({ n, label }, i) => {
            const active = currentStep === n;
            const done = currentStep > n;
            return (
              <Fragment key={n}>
                <div
                  className="flex min-w-0 flex-1 flex-col items-stretch"
                  aria-current={active ? "step" : undefined}
                >
                  <div className="flex min-h-10 min-w-0 items-center gap-2">
                    <span
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                        done || active
                          ? "border-app-primary bg-app-primary text-white"
                          : "border-app-border bg-app-surface text-app-text",
                      ].join(" ")}
                    >
                      {n}
                    </span>
                    <span
                      className={[
                        "min-w-0 flex-1 text-sm font-medium leading-snug sm:text-base",
                        active
                          ? "text-app-primary"
                          : done
                            ? "text-app-text"
                            : "text-app-muted",
                      ].join(" ")}
                    >
                      {label}
                    </span>
                  </div>
                  <div
                    className={[
                      "mt-3 h-px w-full rounded-full transition-colors",
                      active ? "bg-app-primary" : "bg-transparent",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                </div>
                {i < steps.length - 1 ? (
                  <div
                    className="flex h-10 w-3 shrink-0 items-center justify-center self-center sm:w-6"
                    aria-hidden="true"
                  >
                    <span className="block h-px w-full rounded-full bg-app-border" />
                  </div>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
