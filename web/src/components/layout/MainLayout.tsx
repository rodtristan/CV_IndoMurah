"use client";

import { Bell, Search, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { POSSidebar, UserMenu } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment
      .split("-")
      .map(capitalize)
      .join(" ");

    return {
      href,
      label,
      isLast: index === segments.length - 1,
    };
  });

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-1.5">
          {index > 0 && <span className="text-muted">/</span>}
          {crumb.isLast ? (
            <span className="font-medium text-highlighted">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted transition-colors hover:text-highlighted"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-default bg-elevated/50 transition-all duration-200",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-default px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
              <span className="text-sm font-bold">KT</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-highlighted">
                  Ketoko
                </span>
                <span className="text-xs text-muted">POS System</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        {!collapsed && <POSSidebar />}
        {collapsed && (
          <div className="flex-1 overflow-y-auto py-4">
            <POSSidebar collapsed />
          </div>
        )}

        {/* User */}
        {!collapsed && <UserMenu />}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-r-full bg-primary text-white shadow-lg transition-transform hover:scale-110"
          style={{ left: collapsed ? "60px" : "248px" }}
        >
          {collapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-default bg-elevated px-4">
          <div className="flex items-center gap-4">
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex size-9 items-center justify-center rounded-lg text-toned transition-colors hover:bg-elevated hover:text-highlighted">
              <Search className="size-5" />
            </button>
            <button className="relative flex size-9 items-center justify-center rounded-lg text-toned transition-colors hover:bg-elevated hover:text-highlighted">
              <Bell className="size-5" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
