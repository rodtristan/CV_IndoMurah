"use client";

import { useState } from "react";
import { sub } from "date-fns";
import { Bell, Plus, Send, UserPlus } from "lucide-react";
import { Navbar, Toolbar } from "@/components/layout/PageHeader";
import { SidebarCollapseButton } from "@/components/layout/SidebarCollapseButton";
import { Chip } from "@/components/ui/Chip";
import { Tooltip } from "@/components/ui/Tooltip";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { HomeDateRangePicker } from "./HomeDateRangePicker";
import { HomePeriodSelect } from "./HomePeriodSelect";
import { HomeStats } from "./HomeStats";
import { HomeChart } from "./HomeChart";
import { HomeSales } from "./HomeSales";
import { useDashboard } from "@/lib/dashboard-context";
import type { Period, Range } from "@/types";

const newItems: DropdownItem[][] = [
  [
    { label: "New mail", icon: Send, href: "/inbox" },
    { label: "New customer", icon: UserPlus, href: "/customers" },
  ],
];

export function HomeView() {
  const { setNotificationsSlideoverOpen } = useDashboard();
  const [range, setRange] = useState<Range>({ start: sub(new Date(), { days: 14 }), end: new Date() });
  const [period, setPeriod] = useState<Period>("daily");

  return (
    <div className="flex w-full min-w-0 flex-col overflow-hidden">
      <Navbar
        title="Home"
        leading={<SidebarCollapseButton />}
        right={
          <>
            <Tooltip text="Notifications" shortcuts={["N"]}>
              <button
                type="button"
                onClick={() => setNotificationsSlideoverOpen(true)}
                className="flex size-8 items-center justify-center rounded-md text-toned hover:bg-elevated"
              >
                <Chip color="error" inset>
                  <Bell className="size-5 shrink-0" />
                </Chip>
              </button>
            </Tooltip>

            <Dropdown sections={newItems} align="end">
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90"
              >
                <Plus className="size-5" />
              </button>
            </Dropdown>
          </>
        }
      >
        <Toolbar
          left={
            <>
              <HomeDateRangePicker range={range} onChange={setRange} className="-ms-1" />
              <HomePeriodSelect period={period} onChange={setPeriod} range={range} />
            </>
          }
        />
      </Navbar>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
          <HomeStats period={period} range={range} />
          <HomeChart period={period} range={range} />
          <HomeSales period={period} range={range} />
        </div>
      </div>
    </div>
  );
}
