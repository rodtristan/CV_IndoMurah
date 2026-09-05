"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, X, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastAction {
  label: string;
  onClick?: () => void;
}

interface ToastOptions {
  title: string;
  description?: string;
  color?: "success" | "error" | "neutral";
  duration?: number;
  actions?: ToastAction[];
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  add: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const add = useCallback(
    (options: ToastOptions) => {
      const id = ++idCounter;
      const duration = options.duration ?? 5000;
      setToasts((t) => [...t, { ...options, id }]);
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ add }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex w-full flex-col gap-2 p-4 sm:max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-in slide-in-from-bottom-2 fade-in pointer-events-auto flex items-start gap-2.5 rounded-lg border border-default bg-bg p-4 shadow-lg"
          >
            {toast.color === "success" && <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />}
            {toast.color === "error" && <XCircle className="mt-0.5 size-5 shrink-0 text-error" />}
            {(!toast.color || toast.color === "neutral") && <Info className="mt-0.5 size-5 shrink-0 text-dimmed" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-highlighted">{toast.title}</p>
              {toast.description && <p className="mt-0.5 text-sm text-muted">{toast.description}</p>}
              {toast.actions && toast.actions.length > 0 && (
                <div className="mt-2.5 flex gap-1.5">
                  {toast.actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        action.onClick?.();
                        remove(toast.id);
                      }}
                      className={cn(
                        "rounded-md border border-default px-2.5 py-1 text-xs font-medium text-toned hover:bg-elevated",
                      )}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => remove(toast.id)}
              className="shrink-0 rounded-md p-1 text-dimmed hover:bg-elevated hover:text-default"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
