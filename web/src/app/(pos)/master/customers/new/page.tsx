"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CustomerForm } from "@/components/master/CustomerForm";

function Inner() {
  const copy = Number(useSearchParams().get("copyFrom")) || undefined;
  return <CustomerForm copyFrom={copy} />;
}

export default function NewPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
