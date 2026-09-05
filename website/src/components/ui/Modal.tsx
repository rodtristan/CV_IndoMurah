"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} transition className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-950/50 transition duration-200 ease-out data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className={cn(
            "w-full max-w-md rounded-lg border border-default bg-bg p-4 shadow-xl transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 sm:p-6",
            className,
          )}
        >
          {title && (
            <DialogTitle className="text-base font-semibold text-highlighted">{title}</DialogTitle>
          )}
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          <div className={cn(title || description ? "mt-4" : "")}>{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
