import type { ReactNode } from "react";
import { Navbar, Toolbar } from "@/components/layout/PageHeader";
import { SidebarCollapseButton } from "@/components/layout/SidebarCollapseButton";
import { SettingsNav } from "@/components/settings/SettingsNav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full min-w-0 flex-col overflow-hidden">
      <Navbar title="Settings" leading={<SidebarCollapseButton />}>
        <Toolbar left={<SettingsNav />} />
      </Navbar>

      <div className="flex-1 overflow-y-auto scrollbar-thin lg:py-12">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 sm:gap-6 sm:px-6 lg:gap-12">{children}</div>
      </div>
    </div>
  );
}
