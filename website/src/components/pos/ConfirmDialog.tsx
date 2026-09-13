"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = "Konfirmasi",
  message = "Apakah Anda yakin?",
  confirmText = "Ya",
  cancelText = "Batal",
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onCancel} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-950/50 transition data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className={cn(
            "w-full max-w-md rounded-lg border border-default bg-bg shadow-xl",
            "transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0"
          )}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                variant === "danger" ? "bg-red-100" : "bg-blue-100"
              )}>
                <AlertTriangle className={cn(
                  "size-5",
                  variant === "danger" ? "text-red-600" : "text-blue-600"
                )} />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-semibold text-foreground">
                  {title}
                </DialogTitle>
                <p className="mt-2 text-sm text-muted">{message}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={onCancel} disabled={loading}>
                {cancelText}
              </Button>
              <Button
                color={variant === "danger" ? "error" : "primary"}
                variant="solid"
                onClick={onConfirm}
                loading={loading}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
