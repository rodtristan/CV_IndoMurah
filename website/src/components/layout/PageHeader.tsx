import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Navbar({
  title,
  leading,
  trailing,
  right,
  children,
}: {
  title?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-default">
      <div className="flex h-16 items-center gap-1.5 px-4 sm:px-6">
        {leading}
        {title && (
          <h1 className="flex min-w-0 items-center gap-2 truncate text-base font-semibold text-highlighted">
            <span className="truncate">{title}</span>
            {trailing}
          </h1>
        )}
        <div className="flex-1" />
        {right && <div className="flex items-center gap-1.5">{right}</div>}
      </div>
      {children}
    </div>
  );
}

export function Toolbar({ left, right, className }: { left?: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-1.5 border-t border-default px-4 py-2.5 sm:px-6", className)}>
      <div className="flex flex-1 items-center gap-1.5">{left}</div>
      {right && <div className="flex items-center gap-1.5">{right}</div>}
    </div>
  );
}
