"use client";

import { use } from "react";
import { TransactionForm } from "@/components/transaction/TransactionForm";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TransactionForm kind="sale-order" id={id} />;
}
