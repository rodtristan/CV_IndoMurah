"use client";

import { use } from "react";
import { PaymentBatchForm } from "@/components/payments/PaymentBatch";

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return <PaymentBatchForm kind="sale" code={code} />;
}
