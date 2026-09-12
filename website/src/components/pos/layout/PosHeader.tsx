"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePOS } from "@/lib/pos-context";

export function PosHeader() {
  const {
    setMobileSidebarOpen,
    toggleSidebarCollapsed,
  } = usePOS();

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center bg-gradient-to-r from-[#4a148c] to-[#9C27B0] shadow-md">
      {/* Hamburger Menu Button - Toggle Sidebar */}
      <button
        onClick={toggleSidebarCollapsed}
        className="flex h-full items-center px-4 text-white/80 hover:bg-white/10 transition-colors"
        title="Toggle Sidebar"
      >
        <Menu className="size-5" />
      </button>

      {/* Left section - KETOKO branding (Matching Original) */}
      <Link href="/dashboard" className="flex items-center gap-2 px-5 h-full hover:bg-white/10 transition-colors">
        <span className="text-lg font-bold tracking-wide text-white">KETOKO</span>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />
    </header>
  );
}
