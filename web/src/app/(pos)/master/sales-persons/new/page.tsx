"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SalesForm } from "@/components/master/SalesForm";

function Inner() {
  const copy = Number(useSearchParams().get("copyFrom")) || undefined;
  return <SalesForm copyFrom={copy} />;
}

export default function NewPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
