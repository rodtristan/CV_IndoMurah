"use client";

import { Fragment, type ReactNode } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  type?: "item" | "label" | "separator" | "checkbox";
  label?: string;
  icon?: LucideIcon;
  href?: string;
  target?: string;
  color?: "error" | "neutral" | "primary";
  onSelect?: () => void;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  chip?: string;
  disabled?: boolean;
}

interface DropdownProps {
  sections: DropdownItem[][];
  children: ReactNode;
  align?: "start" | "end" | "center";
  widthClassName?: string;
}

export function Dropdown({ sections, children, align = "start", widthClassName = "w-56" }: DropdownProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton as={Fragment}>{children}</MenuButton>
      <MenuItems
        transition
        anchor={align === "end" ? "bottom end" : align === "center" ? "bottom" : "bottom start"}
        className={cn(
          "z-40 [--anchor-gap:6px] origin-top rounded-lg border border-default bg-bg p-1 shadow-lg transition duration-100 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0",
          widthClassName,
        )}
      >
        {sections.map((section, si) => (
          <div key={si} className={cn(si > 0 && "mt-1 border-t border-default pt-1")}>
            {section.map((item, ii) => {
              if (item.type === "label") {
                return (
                  <div key={ii} className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-dimmed">
                    {item.chip && <ColorChip color={item.chip} />}
                    {item.label}
                  </div>
                );
              }
              if (item.type === "separator") {
                return <div key={ii} className="my-1 border-t border-default" />;
              }

              const Icon = item.icon;
              const isCheckbox = item.type === "checkbox";

              const itemClasses = (active: boolean) =>
                cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                  item.color === "error" ? "text-error" : "text-toned",
                  active && (item.color === "error" ? "bg-error/10" : "bg-elevated text-highlighted"),
                  item.disabled && "cursor-not-allowed opacity-50",
                );

              const inner = () => (
                <>
                  {isCheckbox && (
                    <span className="flex size-4 items-center justify-center">
                      {item.checked && <Check className="size-3.5" />}
                    </span>
                  )}
                  {item.chip && <ColorChip color={item.chip} />}
                  {Icon && !isCheckbox && <Icon className="size-4 shrink-0" />}
                  <span className="flex-1 truncate capitalize">{item.label}</span>
                </>
              );

              return (
                <MenuItem key={ii} disabled={item.disabled}>
                  {({ focus }) =>
                    item.href ? (
                      <Link
                        href={item.href}
                        target={item.target}
                        className={itemClasses(focus)}
                        onClick={() => item.onSelect?.()}
                      >
                        {inner()}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className={itemClasses(focus)}
                        onClick={(e) => {
                          if (isCheckbox) {
                            e.preventDefault();
                            item.onCheckedChange?.(!item.checked);
                            return;
                          }
                          item.onSelect?.();
                        }}
                      >
                        {inner()}
                      </button>
                    )
                  }
                </MenuItem>
              );
            })}
          </div>
        ))}
      </MenuItems>
    </Menu>
  );
}

function ColorChip({ color }: { color: string }) {
  return (
    <span
      className="inline-flex size-2 shrink-0 rounded-full"
      style={{ backgroundColor: `var(--color-${color}-500, var(--color-zinc-500))` }}
    />
  );
}
