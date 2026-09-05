"use client";

import { sub } from "date-fns";
import { Calendar } from "lucide-react";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import type { Range } from "@/types";

const df = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const ranges: { label: string; days?: number; months?: number; years?: number }[] = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 3 months", months: 3 },
  { label: "Last 6 months", months: 6 },
  { label: "Last year", years: 1 },
];

export function HomeDateRangePicker({
  range,
  onChange,
  className,
}: {
  range: Range;
  onChange: (range: Range) => void;
  className?: string;
}) {
  const sections: DropdownItem[][] = [
    ranges.map((r) => ({
      label: r.label,
      onSelect: () => {
        const end = new Date();
        const start = sub(end, { days: r.days, months: r.months, years: r.years });
        onChange({ start, end });
      },
    })),
  ];

  const label = range.start
    ? range.end
      ? `${df.format(range.start)} - ${df.format(range.end)}`
      : df.format(range.start)
    : "Pick a date";

  return (
    <Dropdown sections={sections} align="start" widthClassName="w-48">
      <button
        type="button"
        className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-toned hover:bg-elevated data-open:bg-elevated ${className ?? ""}`}
      >
        <Calendar className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </button>
    </Dropdown>
  );
}
