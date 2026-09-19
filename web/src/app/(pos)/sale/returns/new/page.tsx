"use client";

import { use } from "react";
import { TransactionForm } from "@/components/transaction/TransactionForm";

export default function Page({ searchParams }: { searchParams: Promise<{ copy?: string; saleId?: string }> }) {
  const { copy, saleId } = use(searchParams);
  return <TransactionForm kind="sale-return" copyFrom={copy} presetRef={saleId} />;
}
