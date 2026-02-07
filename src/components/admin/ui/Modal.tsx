"use client";

import { useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-2xl border border-border bg-white shadow-xl",
          "animate-[scaleIn_200ms_ease-out]",
          size === "sm" && "max-w-sm",
          size === "md" && "max-w-lg",
          size === "lg" && "max-w-2xl",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2
              id="modal-title"
              className="text-lg font-semibold text-charcoal"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-muted">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-lg p-1.5 text-muted hover:bg-surface hover:text-charcoal transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-surface/50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* Convenience button styles for modal footers */
export function ModalCancelButton({
  onClick,
  children = "Cancel",
}: {
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-charcoal hover:bg-white transition-colors"
    >
      {children}
    </button>
  );
}

export function ModalConfirmButton({
  onClick,
  variant = "primary",
  disabled,
  children = "Confirm",
}: {
  onClick: () => void;
  variant?: "primary" | "danger";
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
        variant === "primary" &&
          "bg-brand text-white hover:bg-brand-hover",
        variant === "danger" &&
          "bg-red-600 text-white hover:bg-red-700"
      )}
    >
      {children}
    </button>
  );
}
