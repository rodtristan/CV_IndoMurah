"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw] max-h-[95vh]",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closable = true,
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closable ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative z-10 w-full rounded-xl border border-default bg-elevated shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200",
          sizeStyles[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-default px-6 py-4">
            <h2 className="text-lg font-semibold text-highlighted">{title}</h2>
            {closable && (
              <button
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-highlighted"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-default px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya",
  cancelText = "Batal",
  variant = "danger",
  loading,
}: ConfirmModalProps) {
  const variantStyles = {
    danger: "bg-danger hover:bg-danger/90",
    warning: "bg-warning hover:bg-warning/90",
    primary: "bg-primary hover:bg-primary/90",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      closable={!loading}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-default bg-elevated px-4 py-2 text-sm font-medium text-highlighted transition-colors hover:bg-elevated/80 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50",
              variantStyles[variant]
            )}
          >
            {loading ? "Memproses..." : confirmText}
          </button>
        </>
      }
    >
      <p className="text-sm text-muted">{message}</p>
    </Modal>
  );
}
