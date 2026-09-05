"use client";

import { Switch as HuiSwitch } from "@headlessui/react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

export function Switch({ checked, onChange, className }: SwitchProps) {
  return (
    <HuiSwitch
      checked={checked}
      onChange={onChange}
      className={cn(
        "group relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-elevated ring-1 ring-inset ring-default",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block size-3.5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4.5" : "translate-x-1",
        )}
      />
    </HuiSwitch>
  );
}
