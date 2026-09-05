"use client";

import { useEffect, useState } from "react";
import { Badge, type BadgeColor } from "@/components/ui/Badge";
import { randomInt, randomFrom, formatCurrencyEUR } from "@/lib/utils";
import type { Period, Range, Sale, SaleStatus } from "@/types";

const sampleEmails = [
  "james.anderson@example.com",
  "mia.white@example.com",
  "william.brown@example.com",
  "emma.davis@example.com",
  "ethan.harris@example.com",
];

const statusColor: Record<SaleStatus, BadgeColor> = {
  paid: "success",
  failed: "error",
  refunded: "neutral",
};

export function HomeSales({ period, range }: { period: Period; range: Range }) {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const currentDate = new Date();
    const generated: Sale[] = [];
    for (let i = 0; i < 5; i++) {
      const hoursAgo = randomInt(0, 48);
      const date = new Date(currentDate.getTime() - hoursAgo * 3600000);
      generated.push({
        id: (4600 - i).toString(),
        date: date.toISOString(),
        status: randomFrom<SaleStatus>(["paid", "failed", "refunded"]),
        email: randomFrom(sampleEmails),
        amount: randomInt(100, 1000),
      });
    }
    generated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    // Random demo data must be generated client-side only (after mount) to
    // avoid a server/client hydration mismatch, hence setState in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSales(generated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, range.start.getTime(), range.end.getTime()]);

  return (
    <div className="overflow-x-auto rounded-lg border border-default">
      <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
        <thead className="bg-elevated/50">
          <tr>
            <th className="w-20 border-b border-default px-4 py-2 text-left font-medium text-muted">ID</th>
            <th className="border-b border-default px-4 py-2 text-left font-medium text-muted">Date</th>
            <th className="border-b border-default px-4 py-2 text-left font-medium text-muted">Status</th>
            <th className="border-b border-default px-4 py-2 text-left font-medium text-muted">Email</th>
            <th className="border-b border-default px-4 py-2 text-right font-medium text-muted">Amount</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale, i) => (
            <tr key={sale.id} className={i === sales.length - 1 ? "" : ""}>
              <td className="border-b border-default px-4 py-2.5 text-toned">#{sale.id}</td>
              <td className="border-b border-default px-4 py-2.5 text-toned">
                {new Date(sale.date).toLocaleString("en-US", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </td>
              <td className="border-b border-default px-4 py-2.5">
                <Badge color={statusColor[sale.status]} variant="subtle" className="capitalize">
                  {sale.status}
                </Badge>
              </td>
              <td className="truncate border-b border-default px-4 py-2.5 text-toned">{sale.email}</td>
              <td className="border-b border-default px-4 py-2.5 text-right font-medium text-highlighted">
                {formatCurrencyEUR(sale.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
