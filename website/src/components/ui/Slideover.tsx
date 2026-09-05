"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideoverProps {
  open: boolean;
  onClose: (open: boolean) => void;
  title?: string;
  children?: ReactNode;
  widthClassName?: string;
  noPadding?: boolean;
}

export function Slideover({ open, onClose, title, children, widthClassName = "max-w-md", noPadding }: SlideoverProps) {
  return (
    <Dialog open={open} onClose={onClose} transition className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-950/50 transition duration-200 ease-out data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex justify-end">
        <DialogPanel
          transition
          className={cn(
            "flex h-full w-full flex-col overflow-hidden border-l border-default bg-bg shadow-xl transition duration-200 ease-out data-closed:translate-x-full",
            widthClassName,
          )}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-default p-4 sm:px-6">
              <DialogTitle className="text-base font-semibold text-highlighted">{title}</DialogTitle>
              <button
                type="button"
                onClick={() => onClose(false)}
                className="rounded-md p-1.5 text-toned hover:bg-elevated"
              >
                <X className="size-5" />
              </button>
            </div>
          )}
          <div className={cn("flex-1 overflow-y-auto", !noPadding && "p-4 sm:p-6")}>{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
