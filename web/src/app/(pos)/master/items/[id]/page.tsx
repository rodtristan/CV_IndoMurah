"use client";

import { Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import { ItemForm } from "@/components/master/ItemForm";

function EditItem({ id }: { id: string }) {
  const saved = useSearchParams().get("saved") === "1";
  return <ItemForm key={id} id={id} justSaved={saved} />;
}

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense fallback={null}><EditItem id={id} /></Suspense>;
}
