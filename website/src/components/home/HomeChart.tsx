"use client";

import { useEffect, useState } from "react";
import { eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format } from "date-fns";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/Card";
import { randomInt, formatCurrencyUSD } from "@/lib/utils";
import type { Period, Range } from "@/types";

interface DataRecord {
  date: string;
  amount: number;
}

function getDates(period: Period, range: Range): Date[] {
  const interval = { start: range.start, end: range.end };
  if (period === "weekly") return eachWeekOfInterval(interval);
  if (period === "monthly") return eachMonthOfInterval(interval);
  return eachDayOfInterval(interval);
}

function formatDate(date: Date, period: Period): string {
  if (period === "monthly") return format(date, "MMM yyy");
  return format(date, "d MMM");
}

export function HomeChart({ period, range }: { period: Period; range: Range }) {
  const [data, setData] = useState<DataRecord[]>([]);

  useEffect(() => {
    const dates = getDates(period, range);
    const min = 1000;
    const max = 10000;
    // Random demo data must be generated client-side only (after mount) to
    // avoid a server/client hydration mismatch, hence setState in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(
      dates.map((date) => ({
        date: formatDate(date, period),
        amount: randomInt(min, max),
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, range.start.getTime(), range.end.getTime()]);

  const total = data.reduce((acc, d) => acc + d.amount, 0);

  return (
    <Card bodyClassName="px-0! pt-0! pb-3! overflow-visible" className="overflow-visible">
      <div className="mb-2 px-4 sm:px-6 pt-4 sm:pt-6">
        <p className="mb-1.5 text-xs uppercase text-muted">Revenue</p>
        <p className="text-3xl font-semibold text-highlighted">{formatCurrencyUSD(total)}</p>
      </div>

      <div className="h-96 w-full">
        {data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 30, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="homeChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={{ stroke: "var(--color-default)" }}
                tickLine={false}
                interval="preserveStartEnd"
                tick={{ fill: "var(--color-dimmed)", fontSize: 12 }}
                minTickGap={40}
              />
              <Tooltip
                cursor={{ stroke: "var(--color-primary)", strokeWidth: 1 }}
                contentStyle={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-default)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--color-highlighted)", fontWeight: 600 }}
                formatter={(value) => [formatCurrencyUSD(Number(value)), "Amount"]}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#homeChartGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
