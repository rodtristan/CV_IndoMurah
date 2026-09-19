"use client";

import { useParams } from "next/navigation";
import { CustomerForm } from "@/components/master/CustomerForm";

export default function EditPage() {
  const id = Number(useParams<{ id: string }>().id);
  return <CustomerForm id={id} />;
}
