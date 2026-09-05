"use client";

import { useTheme } from "next-themes";
import {
  BookOpen,
  ChevronsUpDown,
  CreditCard,
  Code2,
  LayoutTemplate,
  LogOut,
  Moon,
  Settings as SettingsIcon,
  Sun,
  SunMoon,
  User,
} from "lucide-react";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const user = {
  name: "Benjamin Canac",
  avatar: {
    src: "https://github.com/benjamincanac.png",
    alt: "Benjamin Canac",
  },
};

export function UserMenu({ collapsed }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();

  const sections: DropdownItem[][] = [
    [{ type: "label", label: user.name }],
    [
      { label: "Profile", icon: User },
      { label: "Billing", icon: CreditCard },
      { label: "Settings", icon: SettingsIcon, href: "/settings" },
    ],
    [
      { type: "label", label: "Appearance" },
      {
        label: "Light",
        icon: Sun,
        type: "checkbox",
        checked: theme === "light",
        onCheckedChange: () => setTheme("light"),
      },
      {
        label: "Dark",
        icon: Moon,
        type: "checkbox",
        checked: theme === "dark",
        onCheckedChange: () => setTheme("dark"),
      },
      {
        label: "System",
        icon: SunMoon,
        type: "checkbox",
        checked: theme === "system",
        onCheckedChange: () => setTheme("system"),
      },
    ],
    [
      { label: "Documentation", icon: BookOpen, href: "https://ui.nuxt.com/docs/getting-started/installation/nuxt", target: "_blank" },
      { label: "GitHub repository", icon: Code2, href: "https://github.com/nuxt-ui-templates/dashboard", target: "_blank" },
      { label: "Templates", icon: LayoutTemplate, href: "https://dashboard-template.nuxt.dev/", target: "_blank" },
    ],
    [{ label: "Log out", icon: LogOut }],
  ];

  return (
    <Dropdown sections={sections} align="center" widthClassName={collapsed ? "w-48" : "w-64"}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 rounded-md py-2 text-left text-sm text-toned hover:bg-elevated data-open:bg-elevated",
          collapsed ? "justify-center p-1.5" : "px-2.5",
        )}
      >
        <Avatar src={user.avatar.src} alt={user.avatar.alt} size="sm" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-highlighted">{user.name}</span>
            <ChevronsUpDown className="size-4 shrink-0 text-dimmed" />
          </>
        )}
      </button>
    </Dropdown>
  );
}

