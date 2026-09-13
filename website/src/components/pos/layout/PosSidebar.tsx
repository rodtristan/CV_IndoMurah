"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Database,
  ShoppingCart,
  Store,
  Package,
  Calculator,
  BarChart,
  Settings,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  Menu as MenuIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePOS, POS_MENU } from "@/lib/pos-context";
import { useState } from "react";

// Icon mapping
const iconMap: Record<string, typeof Home> = {
  Home,
  Database,
  ShoppingCart,
  Store,
  Package,
  Calculator,
  BarChart,
  Settings,
};

interface MenuNavItem {
  id: number;
  name: string;
  icon?: string;
  href?: string;
  children?: MenuNavItem[];
}

interface NavItemProps {
  item: MenuNavItem;
  isActive: boolean;
  isExpanded: boolean;
  isCollapsed?: boolean;
  onToggle: () => void;
}

function NavItem({ item, isActive, isExpanded, isCollapsed, onToggle }: NavItemProps) {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon ? iconMap[item.icon] : null;

  // Check if any child is active
  const isChildActive = item.children?.some(
    (child: MenuNavItem) => child.href && (pathname === child.href || pathname.startsWith(child.href + "/"))
  );

  const isMenuActive = isActive || isChildActive;

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
            isMenuActive
              ? "bg-[#9C27B0] text-white shadow-md"
              : "text-white hover:bg-[#3a3c3e] hover:text-white"
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className="size-5" />}
            {!isCollapsed && <span className="font-medium">{item.name}</span>}
          </div>
          {!isCollapsed && (isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ))}
        </button>

        {isExpanded && !isCollapsed && (
          <div className="mt-1 ml-4 space-y-0.5 border-l-2 border-white/20 pl-3">
            {item.children!.map((child: MenuNavItem) => {
              const isChildPageActive = child.href ? pathname === child.href : false;
              return (
                <Link
                  key={child.id}
                  href={child.href || "#"}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-150",
                    isChildPageActive
                      ? "bg-[#9C27B0] text-white font-medium shadow-sm"
                      : "text-white hover:bg-[#3a3c3e] hover:text-white"
                  )}
                >
                  <span className="mr-2">›</span>
                  {child.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || "#"}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 mb-1",
        isMenuActive
          ? "bg-[#9C27B0] text-white shadow-md"
          : "text-white hover:bg-[#3a3c3e] hover:text-white"
      )}
    >
      {Icon && <Icon className="size-5" />}
      {!isCollapsed && <span className="font-medium">{item.name}</span>}
    </Link>
  );
}

export function PosSidebar() {
  const pathname = usePathname();
  const {
    isSidebarCollapsed,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    expandedMenus,
    toggleMenu,
    user,
  } = usePOS();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col bg-[#303234] border-r border-[#252628] shadow-sm transition-all duration-300",
          isSidebarCollapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-14 shrink-0 items-center border-b border-[#252628] px-4">
          <div className="flex flex-col gap-0.5">
            <div className="truncate text-base font-bold text-[#9C27B0]">
              {isSidebarCollapsed ? "" : "XIANGYU"}
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate text-xs text-white/70">
                Toko CV IndoMurah
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {/* Home Link */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 mb-1",
              pathname === "/dashboard"
                ? "bg-[#9C27B0] text-white shadow-md"
                : "text-white hover:bg-[#3a3c3e] hover:text-white"
            )}
          >
            <Home className="size-5" />
            {!isSidebarCollapsed && <span className="font-medium">Dashboard</span>}
          </Link>

          {/* Divider */}
          {!isSidebarCollapsed && <div className="my-2 border-t border-[#252628]" />}

          {/* Menu with accordion effect */}
          <div className="space-y-0.5">
            {POS_MENU.filter(item => item.id > 1).map((item) => {
              const isActive = pathname === item.href;
              const isExpanded = expandedMenus.includes(item.id);
              return (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  isExpanded={isExpanded}
                  isCollapsed={isSidebarCollapsed}
                  onToggle={() => toggleMenu(item.id)}
                />
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-[#252628] p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#9C27B0] text-white shadow-sm">
              <User className="size-4" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">
                  {user?.name || "Admin"}
                </div>
                <div className="truncate text-xs text-white">Administrator</div>
              </div>
            )}
            <button
              onClick={() => {
                localStorage.removeItem("pos_user");
                localStorage.removeItem("pos_token");
                window.location.href = "/login";
              }}
              className="rounded-lg p-2 text-white hover:bg-red-500 transition-all"
              title="Logout"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer - Light (Matching Original) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer */}
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-[#303234] shadow-xl">
            {/* Header with close */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#252628] px-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#9C27B0] text-white shadow-md">
                  <span className="text-sm font-bold">POS</span>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-white">
                    KETOKO
                  </div>
                  <div className="truncate text-xs text-white">POS BETA v1.0</div>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="rounded-lg p-2 text-white hover:bg-[#3a3c3e] hover:text-white"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-2">
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg mb-1",
                  pathname === "/dashboard"
                    ? "bg-[#9C27B0] text-white"
                    : "text-white hover:bg-[#3a3c3e] hover:text-white"
                )}
              >
                <Home className="size-5" />
                <span className="font-medium">Dashboard</span>
              </Link>

              <div className="my-2 border-t border-[#252628]" />

              <div className="space-y-0.5">
                {POS_MENU.filter(item => item.id > 1).map((item) => {
                  const isActive = pathname === item.href;
                  const isExpanded = expandedMenus.includes(item.id);
                  return (
                    <NavItem
                      key={item.id}
                      item={item}
                      isActive={isActive}
                      isExpanded={isExpanded}
                      onToggle={() => toggleMenu(item.id)}
                    />
                  );
                })}
              </div>
            </nav>

            {/* User Section */}
            <div className="border-t border-[#252628] p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#9C27B0] text-white">
                  <User className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white">
                    {user?.name || "Admin"}
                  </div>
                  <div className="truncate text-xs text-white">Administrator</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
