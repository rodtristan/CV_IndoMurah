"use client";

import Link from "next/link";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonColor = "primary" | "neutral" | "error" | "success" | "warning";
export type ButtonVariant = "solid" | "outline" | "ghost" | "subtle" | "soft" | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  trailingIcon?: LucideIcon;
  loading?: boolean;
  square?: boolean;
  block?: boolean;
  href?: string;
  target?: string;
  label?: string;
  children?: ReactNode;
}

const colorVariantClasses: Record<ButtonColor, Record<ButtonVariant, string>> = {
  primary: {
    solid: "bg-primary text-white hover:bg-primary/90 focus-visible:outline-primary",
    outline: "border border-primary text-primary hover:bg-primary/10",
    ghost: "text-primary hover:bg-primary/10",
    subtle: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/25",
    soft: "bg-primary/10 text-primary hover:bg-primary/15",
    link: "text-primary hover:underline underline-offset-4 p-0!",
  },
  neutral: {
    solid: "bg-inverted text-inverted-text hover:opacity-90",
    outline: "border border-default text-toned hover:bg-elevated",
    ghost: "text-toned hover:bg-elevated hover:text-highlighted",
    subtle: "bg-elevated text-highlighted ring-1 ring-inset ring-default",
    soft: "bg-elevated/50 text-toned hover:bg-elevated",
    link: "text-toned hover:underline underline-offset-4 p-0!",
  },
  error: {
    solid: "bg-error text-white hover:bg-error/90",
    outline: "border border-error text-error hover:bg-error/10",
    ghost: "text-error hover:bg-error/10",
    subtle: "bg-error/10 text-error ring-1 ring-inset ring-error/25",
    soft: "bg-error/10 text-error hover:bg-error/15",
    link: "text-error hover:underline underline-offset-4 p-0!",
  },
  success: {
    solid: "bg-success text-white hover:bg-success/90",
    outline: "border border-success text-success hover:bg-success/10",
    ghost: "text-success hover:bg-success/10",
    subtle: "bg-success/10 text-success ring-1 ring-inset ring-success/25",
    soft: "bg-success/10 text-success hover:bg-success/15",
    link: "text-success hover:underline underline-offset-4 p-0!",
  },
  warning: {
    solid: "bg-warning text-white hover:bg-warning/90",
    outline: "border border-warning text-warning hover:bg-warning/10",
    ghost: "text-warning hover:bg-warning/10",
    subtle: "bg-warning/10 text-warning ring-1 ring-inset ring-warning/25",
    soft: "bg-warning/10 text-warning hover:bg-warning/15",
    link: "text-warning hover:underline underline-offset-4 p-0!",
  },
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "text-xs px-2 py-1 gap-1 rounded-md",
  sm: "text-xs px-2.5 py-1.5 gap-1.5 rounded-md",
  md: "text-sm px-2.5 py-1.5 gap-1.5 rounded-md",
  lg: "text-sm px-3 py-2 gap-2 rounded-md",
};

const squareSizeClasses: Record<ButtonSize, string> = {
  xs: "p-1 rounded-md",
  sm: "p-1.5 rounded-md",
  md: "p-1.5 rounded-md",
  lg: "p-2 rounded-md",
};

const iconSizeClasses: Record<ButtonSize, string> = {
  xs: "size-4",
  sm: "size-4",
  md: "size-5",
  lg: "size-5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    color = "primary",
    variant = "solid",
    size = "md",
    icon: Icon,
    trailingIcon: TrailingIcon,
    loading,
    square,
    block,
    href,
    target,
    label,
    children,
    className,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  const content = children ?? label;
  const classes = cn(
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shrink-0",
    colorVariantClasses[color][variant],
    square || (!content && (Icon || TrailingIcon)) ? squareSizeClasses[size] : sizeClasses[size],
    block && "w-full",
    className,
  );

  const inner = (
    <>
      {loading ? (
        <Loader2 className={cn(iconSizeClasses[size], "animate-spin")} />
      ) : (
        Icon && <Icon className={iconSizeClasses[size]} />
      )}
      {content && <span className="truncate">{content}</span>}
      {!loading && TrailingIcon && <TrailingIcon className={iconSizeClasses[size]} />}
    </>
  );

  if (href) {
    return (
      <Link href={href} target={target} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={classes} {...props}>
      {inner}
    </button>
  );
});
