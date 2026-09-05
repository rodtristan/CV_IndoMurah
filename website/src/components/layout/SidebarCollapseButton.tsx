"use client";

import { PanelLeft } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";

export function SidebarCollapseButton({ className = "-ms-1.5" }: { className?: string }) {
  const { toggleSidebarCollapsed, setMobileSidebarOpen } = useDashboard();

  function onClick() {
    const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) {
      toggleSidebarCollapsed();
    } else {
      setMobileSidebarOpen(true);
    }
  }

  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={onClick}
      className={`flex size-8 shrink-0 items-center justify-center rounded-md text-toned hover:bg-elevated ${className}`}
    >
      <PanelLeft className="size-5" />
    </button>
  );
}
