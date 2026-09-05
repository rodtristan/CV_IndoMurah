"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { House, Inbox, Users, Settings, MessageCircle, Info } from "lucide-react";
import { TeamsMenu } from "./TeamsMenu";
import { UserMenu } from "./UserMenu";
import { SearchButton } from "./SearchModal";
import { useDashboard } from "@/lib/dashboard-context";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

const settingsChildren = [
  { label: "General", href: "/settings" },
  { label: "Members", href: "/settings/members" },
  { label: "Notifications", href: "/settings/notifications" },
  { label: "Security", href: "/settings/security" },
];

const primaryLinks = [
  { label: "Home", href: "/", icon: House },
  { label: "Inbox", href: "/inbox", icon: Inbox, badge: "4" },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings, children: settingsChildren },
];

const secondaryLinks = [
  { label: "Feedback", href: "https://github.com/nuxt-ui-templates/dashboard", icon: MessageCircle, external: true },
  { label: "Help & Support", href: "https://github.com/nuxt-ui-templates/dashboard", icon: Info, external: true },
];

function NavLinks({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {primaryLinks.map((link) => {
        const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <div key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              title={collapsed ? link.label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md py-1.5 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-1.5" : "px-2.5",
                isActive ? "bg-primary/10 text-primary" : "text-toned hover:bg-elevated hover:text-highlighted",
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{link.label}</span>
                  {link.badge && <Badge color="neutral" variant="subtle">{link.badge}</Badge>}
                </>
              )}
            </Link>
            {!collapsed && link.children && isActive && (
              <div className="ml-[27px] mt-0.5 flex flex-col gap-0.5 border-l border-default pl-3">
                {link.children.map((child) => {
                  const childActive = child.href === "/settings" ? pathname === "/settings" : pathname === child.href;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-sm transition-colors",
                        childActive ? "text-primary font-medium" : "text-muted hover:text-highlighted",
                      )}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function SecondaryNavLinks({ collapsed }: { collapsed?: boolean }) {
  return (
    <nav className="mt-auto flex flex-col gap-0.5">
      {secondaryLinks.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.label}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            title={collapsed ? link.label : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md py-1.5 text-sm font-medium text-toned transition-colors hover:bg-elevated hover:text-highlighted",
              collapsed ? "justify-center px-1.5" : "px-2.5",
            )}
          >
            <Icon className="size-4.5 shrink-0" />
            {!collapsed && <span className="truncate">{link.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <TeamsMenu collapsed={collapsed} />
      <SearchButton />
      <NavLinks collapsed={collapsed} onNavigate={onNavigate} />
      <SecondaryNavLinks collapsed={collapsed} />
      <div className="border-t border-default pt-3">
        <UserMenu collapsed={collapsed} />
      </div>
    </div>
  );
}

export function Sidebar() {
  const { isSidebarCollapsed, isMobileSidebarOpen, setMobileSidebarOpen } = useDashboard();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-default bg-elevated/25 transition-[width] duration-200 lg:flex lg:flex-col",
          isSidebarCollapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        <SidebarBody collapsed={isSidebarCollapsed} />
      </aside>

      {/* Mobile sidebar drawer */}
      <Dialog open={isMobileSidebarOpen} onClose={setMobileSidebarOpen} transition className="relative z-50 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-zinc-950/50 transition duration-200 ease-out data-closed:opacity-0"
        />
        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="flex h-full w-72 flex-col border-r border-default bg-bg shadow-xl transition duration-200 ease-out data-closed:-translate-x-full"
          >
            <SidebarBody onNavigate={() => setMobileSidebarOpen(false)} />
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
