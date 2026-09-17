"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(api.getToken() ? "/dashboard" : "/auth/login");
  }, [router]);

  return null;
}
