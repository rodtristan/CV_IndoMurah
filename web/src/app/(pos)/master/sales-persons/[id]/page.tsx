"use client";

import { useParams } from "next/navigation";
import { SalesForm } from "@/components/master/SalesForm";

export default function EditPage() {
  const id = Number(useParams<{ id: string }>().id);
  return <SalesForm id={id} />;
}
