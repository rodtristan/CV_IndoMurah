"use client";

import { useParams } from "next/navigation";
import { SupplierForm } from "@/components/master/SupplierForm";

export default function EditPage() {
  const id = Number(useParams<{ id: string }>().id);
  return <SupplierForm id={id} />;
}
