"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

const secondaryBtn =
  "rounded-lg border border-app-border bg-app-surface px-4 py-2 text-sm font-medium text-app-text hover:bg-app-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-primary";

const primaryBtn =
  "rounded-lg bg-app-primary px-4 py-2 text-sm font-semibold text-white hover:bg-app-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-primary";

type Props = {
  open: boolean;
  title: string;
  loading: boolean;
  error: string | null;
  suggestion: string | null;
  editMode: boolean;
  draftText: string;
  onClose: () => void;
  onAccept: () => void;
  onStartEdit: () => void;
  onDiscard: () => void;
  onChangeDraft: (value: string) => void;
  onConfirmEdit: () => void;
};

export function AiSuggestionDialog({
  open,
  title,
  loading,
  error,
  suggestion,
  editMode,
  draftText,
  onClose,
  onAccept,
  onStartEdit,
  onDiscard,
  onChangeDraft,
  onConfirmEdit,
}: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const tId = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("button, textarea, [href]")?.focus();
    }, 0);
    return () => {
      window.clearTimeout(tId);
      previouslyFocused.current?.focus?.();
    };
  }, [open, loading, editMode]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-app-text/40 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={error ? descId : undefined}
        className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-xl"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-start justify-between gap-3 border-b border-app-border px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-app-text">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-lg leading-none text-app-muted hover:bg-app-base hover:text-app-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-primary"
            onClick={onClose}
            aria-label={t("a11y.closeModal")}
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-app-muted" role="status" aria-live="polite">
              {t("ai.loading")}
            </p>
          ) : error ? (
            <p id={descId} className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : editMode ? (
            <div className="space-y-3">
              <p className="text-sm text-app-muted">{t("ai.editHint")}</p>
              <textarea
                value={draftText}
                onChange={(e) => onChangeDraft(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-app-border bg-white px-3 py-2 text-sm text-app-text shadow-inner focus:border-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/20"
              />
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-app-text">
              {suggestion}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-app-border px-5 py-4 sm:flex-row sm:justify-end">
          {!loading && !error && !editMode && suggestion ? (
            <>
              <button type="button" className={secondaryBtn} onClick={onDiscard}>
                {t("ai.discard")}
              </button>
              <button type="button" className={secondaryBtn} onClick={onStartEdit}>
                {t("ai.edit")}
              </button>
              <button type="button" className={primaryBtn} onClick={onAccept}>
                {t("ai.accept")}
              </button>
            </>
          ) : null}
          {!loading && !error && editMode ? (
            <>
              <button type="button" className={secondaryBtn} onClick={onDiscard}>
                {t("ai.discard")}
              </button>
              <button type="button" className={primaryBtn} onClick={onConfirmEdit}>
                {t("ai.useEdited")}
              </button>
            </>
          ) : null}
          {(loading || error) && (
            <button type="button" className={secondaryBtn} onClick={onClose}>
              {t("ai.discard")}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
