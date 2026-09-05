/* eslint-disable @next/next/no-img-element */
import { Store, User as UserIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvatarProps as AvatarPropsType } from "@/types";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

interface AvatarProps extends AvatarPropsType {
  size?: AvatarSize;
  className?: string;
  icon?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "size-5 text-[10px]",
  sm: "size-6 text-xs",
  md: "size-8 text-sm",
  lg: "size-10 text-base",
  xl: "size-11 text-base",
  "2xl": "size-12 text-lg",
  "3xl": "size-14 text-lg",
};

const iconMap: Record<string, LucideIcon> = {
  "i-lucide-store": Store,
  "i-lucide-user": UserIcon,
};

export function Avatar({ src, alt, icon, size = "md", className }: AvatarProps) {
  const Icon = icon ? iconMap[icon] ?? UserIcon : null;

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? ""}
        className={cn("shrink-0 rounded-full bg-elevated object-cover", sizeClasses[size], className)}
      />
    );
  }

  if (Icon) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-elevated text-toned",
          sizeClasses[size],
          className,
        )}
      >
        <Icon className="size-1/2" />
      </span>
    );
  }

  const initials = (alt ?? "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-elevated font-medium text-toned",
        sizeClasses[size],
        className,
      )}
    >
      {initials || <UserIcon className="size-1/2" />}
    </span>
  );
}
