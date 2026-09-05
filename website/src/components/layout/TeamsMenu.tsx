"use client";

import { ChevronsUpDown, CirclePlus, Cog, Store } from "lucide-react";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils";

export function TeamsMenu({ collapsed }: { collapsed?: boolean }) {
  const sections: DropdownItem[][] = [
    [{ label: "Toko CV IndoMurah", icon: undefined }],
    [
      { label: "Create team", icon: CirclePlus },
      { label: "Manage teams", icon: Cog },
    ],
  ];

  return (
    <Dropdown sections={sections} align="center" widthClassName={collapsed ? "w-40" : "w-64"}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 rounded-md py-2 text-left text-sm font-medium text-toned hover:bg-elevated data-open:bg-elevated",
          collapsed ? "justify-center p-1.5" : "px-2.5",
        )}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-inset ring-primary/25">
          <Store className="size-4 text-primary" />
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-highlighted">Toko CV IndoMurah</span>
            <ChevronsUpDown className="size-4 shrink-0 text-dimmed" />
          </>
        )}
      </button>
    </Dropdown>
  );
}
