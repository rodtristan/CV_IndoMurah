"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Kbd } from "./Kbd";

export function Tooltip({
  text,
  shortcuts,
  children,
  className,
}: {
  text: string;
  shortcuts?: string[];
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-md bg-inverted px-2 py-1 text-xs font-medium text-inverted-text shadow-lg">
          {text}
          {shortcuts?.map((s) => (
            <Kbd key={s} className="border-white/20 bg-white/10 text-inverted-text">
              {s}
            </Kbd>
          ))}
        </span>
      )}
    </span>
  );
}
