"use client";

import { use } from "react";
import { TransactionForm } from "@/components/transaction/TransactionForm";

export default function Page({ searchParams }: { searchParams: Promise<{ copy?: string }> }) {
  const { copy } = use(searchParams);
  return <TransactionForm kind="sale-order" copyFrom={copy} />;
}
