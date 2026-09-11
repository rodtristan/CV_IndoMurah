"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelLeft,
  Search,
  Bell,
  ChevronRight,
  X,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePOS } from "@/lib/pos-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface PosHeaderProps {
  title?: string;
  subtitle?: string;
}

export function PosHeader({ title, subtitle }: PosHeaderProps) {
  const pathname = usePathname();
  const {
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    setMobileSidebarOpen,
    isSearchOpen,
    setSearchOpen,
    isNotificationsOpen,
    setNotificationsOpen,
    companyName,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState("");

  // Generate breadcrumb from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return { href, label };
  });

  const displayTitle = title || breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard";

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-default bg-bg px-4 lg:px-6">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="flex size-8 items-center justify-center rounded-md text-toned hover:bg-elevated lg:hidden"
      >
        <PanelLeft className="size-5" />
      </button>

      {/* Desktop Collapse Toggle */}
      <button
        onClick={toggleSidebarCollapsed}
        className="hidden size-8 shrink-0 items-center justify-center rounded-md text-toned hover:bg-elevated lg:flex"
      >
        <PanelLeft className={cn("size-5 transition-transform", !isSidebarCollapsed && "-rotate-180")} />
      </button>

      {/* Breadcrumb / Title */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        {/* Mobile Logo */}
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white lg:hidden">
          <Building2 className="size-4" />
        </div>

        {/* Title */}
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-highlighted">
            {displayTitle}
          </h1>
          {subtitle && (
            <p className="hidden text-xs text-muted sm:block">{subtitle}</p>
          )}
        </div>

        {/* Desktop Breadcrumb */}
        {breadcrumbs.length > 1 && (
          <nav className="hidden items-center gap-1 text-sm text-muted lg:flex">
            <ChevronRight className="size-4" />
            {breadcrumbs.slice(0, -1).map((crumb, index) => (
              <Link
                key={crumb.href}
                href={crumb.href}
                className="hover:text-toned"
              >
                {crumb.label}
              </Link>
            ))}
            <ChevronRight className="size-4" />
            <span className="text-toned">{displayTitle}</span>
          </nav>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Input
            icon={Search}
            placeholder="Cari..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 lg:w-64"
          />
        </div>

        {/* Mobile Search Toggle */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex size-9 items-center justify-center rounded-md text-toned hover:bg-elevated md:hidden"
        >
          <Search className="size-5" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => setNotificationsOpen(!isNotificationsOpen)}
          className="relative flex size-9 items-center justify-center rounded-md text-toned hover:bg-elevated"
        >
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-error" />
        </button>
      </div>

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-x-0 top-0 z-50 bg-bg p-4 shadow-lg lg:hidden">
          <div className="flex items-center gap-3">
            <Input
              icon={Search}
              placeholder="Cari item, transaksi..."
              autoFocus
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(false)}
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {isNotificationsOpen && (
        <div className="fixed right-4 top-16 z-50 w-80 rounded-lg border border-default bg-bg shadow-lg">
          <div className="flex items-center justify-between border-b border-default p-4">
            <h3 className="font-semibold text-highlighted">Notifikasi</h3>
            <button
              onClick={() => setNotificationsOpen(false)}
              className="rounded p-1 text-dimmed hover:bg-elevated"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto p-4">
            <div className="text-center text-muted">
              <Bell className="mx-auto mb-2 size-8 text-dimmed" />
              <p className="text-sm">Tidak ada notifikasi</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
