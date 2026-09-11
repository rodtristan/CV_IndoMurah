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
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePOS, POS_MENU } from "@/lib/pos-context";
import type { MenuItem } from "@/types/pos";

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

interface NavItemProps {
  item: MenuItem;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  collapsed?: boolean;
}

function NavItem({ item, isActive, isExpanded, onToggle, collapsed }: NavItemProps) {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon ? iconMap[item.icon] : null;

  // Check if any child is active
  const isChildActive = item.children?.some(
    (child) => pathname === child.href || pathname.startsWith(child.href + "/")
  );

  const isMenuActive = isActive || isChildActive;

  if (collapsed) {
    return (
      <Link
        href={item.href || "#"}
        title={item.name}
        className={cn(
          "flex size-10 items-center justify-center rounded-md transition-all",
          isMenuActive
            ? "bg-purple-500/20 text-purple-300"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        )}
      >
        {Icon && <Icon className="size-5" />}
        {hasChildren && !Icon && <Database className="size-5" />}
      </Link>
    );
  }

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all",
            isMenuActive
              ? "bg-purple-500/20 text-purple-300"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          )}
        >
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className="size-5" />}
            <span>{item.name}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>

        {isExpanded && (
          <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-slate-700 pl-3">
            {item.children!.map((child) => {
              const isChildPageActive = pathname === child.href;
              return (
                <Link
                  key={child.id}
                  href={child.href || "#"}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-all",
                    isChildPageActive
                      ? "bg-purple-500/20 text-purple-300 font-medium"
                      : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                  )}
                >
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
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
        isMenuActive
          ? "bg-purple-500/20 text-purple-300"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
      )}
    >
      {Icon && <Icon className="size-5" />}
      <span>{item.name}</span>
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
    companyId,
    companyName,
  } = usePOS();

  const handleLogout = () => {
    localStorage.removeItem("pos_user");
    localStorage.removeItem("pos_token");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Desktop Sidebar - Dark Gradient */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col transition-all duration-200 bg-gradient-sidebar",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 shrink-0 items-center border-b border-slate-700/50 px-4">
          {isSidebarCollapsed ? (
            <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-primary text-white shadow-lg shadow-purple-900/30">
              <Building2 className="size-5" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-primary text-white shadow-lg shadow-purple-900/30">
                <Building2 className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {companyName}
                </div>
                <div className="truncate text-xs text-slate-400">{companyId}</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          <div className="flex flex-col gap-1">
            {POS_MENU.map((item) => {
              const isActive = pathname === item.href;
              const isExpanded = expandedMenus.includes(item.id);
              return (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  isExpanded={isExpanded}
                  onToggle={() => toggleMenu(item.id)}
                  collapsed={isSidebarCollapsed}
                />
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-700/50 p-3">
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex size-10 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800/50 hover:text-red-400"
                title="Logout"
              >
                <LogOut className="size-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
                <User className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">
                  {user?.fullName || "Admin"}
                </div>
                <div className="truncate text-xs text-slate-400">Administrator</div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded p-1.5 text-slate-400 hover:bg-slate-800/50 hover:text-red-400"
                title="Logout"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer */}
          <aside className="absolute inset-y-0 left-0 w-72 bg-gradient-sidebar shadow-2xl">
            <div className="flex h-16 shrink-0 items-center border-b border-slate-700/50 px-4">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-primary text-white shadow-lg">
                  <Building2 className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {companyName}
                  </div>
                  <div className="truncate text-xs text-slate-400">{companyId}</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
              <div className="flex flex-col gap-1">
                {POS_MENU.map((item) => {
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
            <div className="border-t border-slate-700/50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
                  <User className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white">
                    {user?.fullName || "Admin"}
                  </div>
                  <div className="truncate text-xs text-slate-400">Administrator</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded p-1.5 text-slate-400 hover:bg-slate-800/50 hover:text-red-400"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
