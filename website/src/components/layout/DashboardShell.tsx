"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { SearchModal } from "./SearchModal";
import { NotificationsSlideover } from "./NotificationsSlideover";
import { useAuth } from "@/lib/auth-context";

const PUBLIC_ROUTES = new Set(["/login"]);

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  useEffect(() => {
    if (status === "unauthenticated" && !isPublicRoute) {
      router.replace("/login");
    }
    if (status === "authenticated" && isPublicRoute) {
      router.replace("/");
    }
  }, [status, isPublicRoute, router]);

  // /login renders its own full-screen layout — no sidebar chrome.
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Auth not resolved yet, or about to redirect to /login — avoid
  // flashing the dashboard shell before that happens.
  if (status !== "authenticated") {
    return (
      <div className="flex h-dvh items-center justify-center bg-bg text-sm text-muted">
        Memuat…
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 overflow-hidden">{children}</div>
      <SearchModal />
      <NotificationsSlideover />
    </div>
  );
}
