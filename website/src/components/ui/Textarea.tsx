"use client";

import { forwardRef, useEffect, useRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoresize?: boolean;
  variant?: "outline" | "none";
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { autoresize, variant = "outline", className, value, onChange, ...props },
  ref,
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!autoresize || !innerRef.current) return;
    innerRef.current.style.height = "auto";
    innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
  }, [autoresize, value]);

  return (
    <textarea
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      value={value}
      onChange={onChange}
      className={cn(
        "block w-full rounded-md text-sm text-highlighted placeholder:text-dimmed focus:outline-none",
        variant === "outline"
          ? "border-0 bg-bg px-3 py-2 ring-1 ring-inset ring-default focus:ring-2 focus:ring-primary"
          : "resize-none border-0 bg-transparent p-0 focus:ring-0",
        className,
      )}
      {...props}
    />
  );
});
