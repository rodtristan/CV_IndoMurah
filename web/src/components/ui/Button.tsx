import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "warning";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: any;
  iconPosition?: "left" | "right";
  loading?: boolean;
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-elevated text-highlighted hover:bg-elevated/80 border border-default",
  outline: "border border-default bg-transparent hover:bg-elevated text-highlighted",
  ghost: "bg-transparent hover:bg-elevated text-muted hover:text-highlighted",
  danger: "bg-danger text-white hover:bg-danger/90 shadow-sm",
  success: "bg-success text-white hover:bg-success/90 shadow-sm",
  warning: "bg-warning text-white hover:bg-warning/90 shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  icon: "h-9 w-9 p-0 justify-center",
};

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading,
  href,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const cls = cn(
    "inline-flex items-center rounded-lg font-medium transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
    "disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  const content = (
    <>
      {loading && (
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && Icon && iconPosition === "left" && <Icon className="size-4" />}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === "right" && <Icon className="size-4" />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }

  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
