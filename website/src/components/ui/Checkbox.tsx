"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  "aria-label"?: string;
  className?: string;
}

export function Checkbox({ checked, indeterminate, onChange, className, ...props }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={cn(
        "size-4 cursor-pointer rounded-sm border-default text-primary accent-[var(--color-primary)] focus:ring-primary",
        className,
      )}
      {...props}
    />
  );
}
