"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { SearchModal } from "./SearchModal";
import { NotificationsSlideover } from "./NotificationsSlideover";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 overflow-hidden">{children}</div>
      <SearchModal />
      <NotificationsSlideover />
    </div>
  );
}
