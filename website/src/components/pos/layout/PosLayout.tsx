"use client";

import type { ReactNode } from "react";
import { PosSidebar } from "./PosSidebar";
import { PosHeader } from "./PosHeader";
import { cn } from "@/lib/utils";

interface PosLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function PosLayout({ children }: PosLayoutProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <PosSidebar />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <PosHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

// Page wrapper for consistent padding
interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn("p-4 sm:p-6", className)}>
      {children}
    </div>
  );
}

// Page title component
interface PageTitleProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageTitle({ title, subtitle, actions, className }: PageTitleProps) {
  return (
    <div className={cn("mb-6 flex items-center justify-between", className)}>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
