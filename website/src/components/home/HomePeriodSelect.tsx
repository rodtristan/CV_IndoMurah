"use client";

import { useEffect, useMemo } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Select } from "@/components/ui/Select";
import type { Period, Range } from "@/types";

export function HomePeriodSelect({
  period,
  onChange,
  range,
}: {
  period: Period;
  onChange: (period: Period) => void;
  range: Range;
}) {
  const periods = useMemo<Period[]>(() => {
    const days = differenceInCalendarDays(range.end, range.start) + 1;
    if (days <= 8) return ["daily"];
    if (days <= 31) return ["daily", "weekly"];
    return ["weekly", "monthly"];
  }, [range]);

  useEffect(() => {
    if (!periods.includes(period)) {
      onChange(periods[0]!);
    }
  }, [periods, period, onChange]);

  return (
    <Select
      variant="ghost"
      value={period}
      onChange={(e) => onChange(e.target.value as Period)}
      options={periods}
    />
  );
}
