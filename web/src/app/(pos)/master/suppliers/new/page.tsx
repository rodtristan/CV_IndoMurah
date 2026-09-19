"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SupplierForm } from "@/components/master/SupplierForm";

function Inner() {
  const copy = Number(useSearchParams().get("copyFrom")) || undefined;
  return <SupplierForm copyFrom={copy} />;
}

export default function NewPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
