"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export const formControlClass =
  "h-11 w-full min-w-0 border-0 bg-transparent px-3 py-2.5 text-sm text-app-text outline-none placeholder:text-slate-400";

type Props = {
  id: string;
  label: string;
  required?: boolean;
  icon: LucideIcon;
  error?: string;
  children: ReactNode;
  className?: string;
  /** For textareas: align icon to top */
  iconTop?: boolean;
  /** e.g. "Help me write" beside the label */
  labelAction?: ReactNode;
};

export function FormField({
  id,
  label,
  required,
  icon: Icon,
  error,
  children,
  className = "",
  iconTop = false,
  labelAction,
}: Props) {
  const shellError = Boolean(error);
  return (
    <div className={className}>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="flex items-center gap-1 text-sm font-medium text-app-text"
        >
          {label}
          {required ? (
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {labelAction}
      </div>
      <div
        className={[
          "flex overflow-hidden rounded-lg border bg-app-surface transition-shadow",
          iconTop ? "items-stretch" : "items-center",
          shellError
            ? "border-red-300 shadow-[inset_0_0_0_1px_rgba(252,165,165,0.5)] focus-within:border-red-500 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
            : "border-app-border focus-within:border-app-primary focus-within:shadow-[0_0_0_3px_rgba(72,77,255,0.18)]",
        ].join(" ")}
      >
        <span
          className={[
            "flex shrink-0 items-center justify-center border-app-border bg-app-icon-bg px-3 text-app-muted",
            iconTop ? "self-start border-e py-3" : "border-e",
          ].join(" ")}
          aria-hidden="true"
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
