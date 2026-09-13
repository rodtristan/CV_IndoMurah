"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { POSSidebar } from "@/components/layout/POSSidebar";
import { DashboardProvider, useDashboard } from "@/lib/dashboard-context";
import { AuthProvider } from "@/lib/auth-context";
import { Bell, Search, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return { href, label, isLast: index === segments.length - 1 };
  });

  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-2">
          {index > 0 && <span className="text-muted">/</span>}
          {crumb.isLast ? (
            <span className="font-medium text-highlighted">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-muted hover:text-highlighted">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

function NavbarContent() {
  return (
    <div className="flex h-14 items-center justify-between border-b border-default px-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-md text-toned hover:bg-elevated lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-md text-toned hover:bg-elevated"
        >
          <Search className="size-5" />
        </button>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-md text-toned hover:bg-elevated"
        >
          <Bell className="size-5" />
        </button>
      </div>
    </div>
  );
}

function POSLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed, toggleSidebarCollapsed } = useDashboard();

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-default bg-elevated/25 transition-all duration-200 lg:flex lg:flex-col ${
          isSidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex h-14 items-center border-b border-default px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-white">
              <span className="text-lg font-bold">IM</span>
            </div>
            {!isSidebarCollapsed && (
              <span className="font-semibold">Toko IndoMurah</span>
            )}
          </Link>
        </div>
        <POSSidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <NavbarContent />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <POSLayoutContent>{children}</POSLayoutContent>
    </DashboardProvider>
  );
}
