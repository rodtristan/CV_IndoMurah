"use client";

import { useEffect, useState } from "react";
import { Users, ChartPie, CircleDollarSign, ShoppingCart, type LucideIcon } from "lucide-react";
import { PageCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { randomInt, formatCurrencyUSD } from "@/lib/utils";
import type { Period, Range } from "@/types";

interface BaseStat {
  title: string;
  icon: LucideIcon;
  minValue: number;
  maxValue: number;
  minVariation: number;
  maxVariation: number;
  formatter?: (value: number) => string;
}

const baseStats: BaseStat[] = [
  { title: "Customers", icon: Users, minValue: 400, maxValue: 1000, minVariation: -15, maxVariation: 25 },
  { title: "Conversions", icon: ChartPie, minValue: 1000, maxValue: 2000, minVariation: -10, maxVariation: 20 },
  {
    title: "Revenue",
    icon: CircleDollarSign,
    minValue: 200000,
    maxValue: 500000,
    minVariation: -20,
    maxVariation: 30,
    formatter: formatCurrencyUSD,
  },
  { title: "Orders", icon: ShoppingCart, minValue: 100, maxValue: 300, minVariation: -5, maxVariation: 15 },
];

interface Stat {
  title: string;
  icon: LucideIcon;
  value: number | string;
  variation: number;
}

export function HomeStats({ period, range }: { period: Period; range: Range }) {
  const [stats, setStats] = useState<Stat[] | null>(null);

  useEffect(() => {
    // Random demo data must be generated client-side only (after mount) to
    // avoid a server/client hydration mismatch, hence setState in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats(
      baseStats.map((stat) => {
        const value = randomInt(stat.minValue, stat.maxValue);
        const variation = randomInt(stat.minVariation, stat.maxVariation);
        return {
          title: stat.title,
          icon: stat.icon,
          value: stat.formatter ? stat.formatter(value) : value,
          variation,
        };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, range.start.getTime(), range.end.getTime()]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-px">
      {(stats ?? baseStats.map((s) => ({ title: s.title, icon: s.icon, value: "—", variation: 0 }))).map(
        (stat, index) => (
          <PageCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            titleClassName="font-normal text-muted text-xs uppercase"
            to="/customers"
            variant="subtle"
            className="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-10"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-highlighted">{stat.value}</span>
              {stats && (
                <Badge color={stat.variation > 0 ? "success" : "error"} variant="subtle">
                  {stat.variation > 0 ? "+" : ""}
                  {stat.variation}%
                </Badge>
              )}
            </div>
          </PageCard>
        ),
      )}
    </div>
  );
}
