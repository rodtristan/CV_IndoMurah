"use client";

import { use } from "react";
import { CommissionForm } from "@/components/payments/CommissionPayment";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CommissionForm id={id} />;
}
