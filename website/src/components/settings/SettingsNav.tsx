"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Users, Bell, Shield, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "General", href: "/settings", icon: User, exact: true },
  { label: "Members", href: "/settings/members", icon: Users },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
  { label: "Security", href: "/settings/security", icon: Shield },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="-mx-1 flex flex-1 items-center gap-1 overflow-x-auto">
      {links.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
              isActive ? "text-primary" : "text-toned hover:text-highlighted",
            )}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
      <Link
        href="https://ui.nuxt.com/docs/getting-started/installation/nuxt"
        target="_blank"
        className="ml-auto flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium text-toned hover:text-highlighted"
      >
        <BookOpen className="size-4" />
        Documentation
      </Link>
    </div>
  );
}
