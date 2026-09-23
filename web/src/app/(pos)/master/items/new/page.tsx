"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ItemForm } from "@/components/master/ItemForm";

function NewItem() {
  const copyFrom = useSearchParams().get("copyFrom") ?? undefined;
  return <ItemForm key={copyFrom ?? "new"} copyFrom={copyFrom} />;
}

export default function NewItemPage() {
  return <Suspense fallback={null}><NewItem /></Suspense>;
}
