"use client";

import { Fragment, type ReactNode } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface POSModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

export function POSModal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
}: POSModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-950/50 transition data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className={cn(
            "w-full rounded-lg border border-default bg-bg shadow-xl",
            "transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0",
            sizeClasses[size],
            className
          )}
        >
          {/* Header */}
          {(title || description) && (
            <div className="flex items-start justify-between border-b border-default px-6 py-4">
              <div>
                {title && (
                  <DialogTitle className="text-base font-semibold text-highlighted">
                    {title}
                  </DialogTitle>
                )}
                {description && (
                  <p className="mt-1 text-sm text-muted">{description}</p>
                )}
              </div>
              <button
                onClick={() => onClose(false)}
                className="rounded p-1 text-dimmed hover:bg-elevated hover:text-toned"
              >
                <X className="size-5" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

// Modal Footer for buttons
interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn("mt-6 flex justify-end gap-3 border-t border-default pt-4", className)}>
      {children}
    </div>
  );
}
