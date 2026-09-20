"use client";

import { use } from "react";
import { UserForm } from "../../_lib/UserForm";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <UserForm id={id} />;
}
