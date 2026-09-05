import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function Card({
  children,
  header,
  className,
  bodyClassName,
}: {
  children?: ReactNode;
  header?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-default bg-bg", className)}>
      {header && <div className="border-b border-default p-4 sm:px-6">{header}</div>}
      <div className={cn("p-4 sm:p-6", bodyClassName)}>{children}</div>
    </div>
  );
}

interface PageCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  to?: string;
  variant?: "subtle" | "naked" | "solid";
  orientation?: "horizontal" | "vertical";
  className?: string;
  titleClassName?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export function PageCard({
  title,
  description,
  icon: Icon,
  to,
  variant = "subtle",
  orientation = "vertical",
  className,
  titleClassName,
  children,
  footer,
}: PageCardProps) {
  const content = (
    <>
      <div
        className={cn(
          "flex gap-4",
          orientation === "horizontal" ? "flex-col items-start sm:flex-row sm:items-center sm:justify-between" : "flex-col",
        )}
      >
        <div className="flex min-w-0 flex-col gap-1.5">
          {Icon && (
            <span className="flex size-9 items-center justify-center self-start rounded-full bg-primary/10 ring-1 ring-inset ring-primary/25">
              <Icon className="size-4 text-primary" />
            </span>
          )}
          {title && <p className={cn("font-medium text-highlighted", titleClassName)}>{title}</p>}
          {description && <p className="text-sm text-muted">{description}</p>}
          {children}
        </div>
        {footer && <div className={orientation === "horizontal" ? "w-fit shrink-0 lg:ms-auto" : ""}>{footer}</div>}
      </div>
    </>
  );

  const wrapperClassName = cn(
    "block rounded-lg p-4 sm:p-6",
    variant === "subtle" && "bg-elevated/50 ring-1 ring-inset ring-default",
    variant === "solid" && "bg-inverted text-inverted-text",
    to && "transition-colors hover:bg-elevated",
    className,
  );

  if (to) {
    return (
      <Link href={to} className={wrapperClassName}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClassName}>{content}</div>;
}
