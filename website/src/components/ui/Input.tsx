import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon: Icon, className, ...props },
  ref,
) {
  return (
    <div className={cn("relative inline-flex items-center", className)}>
      {Icon && <Icon className="pointer-events-none absolute left-2.5 size-4 text-dimmed" />}
      <input
        ref={ref}
        className={cn(
          "block w-full rounded-md border-0 bg-bg py-1.5 text-sm text-highlighted ring-1 ring-inset ring-default placeholder:text-dimmed focus:outline-none focus:ring-2 focus:ring-primary",
          Icon ? "pl-8 pr-3" : "px-3",
        )}
        {...props}
      />
    </div>
  );
});
