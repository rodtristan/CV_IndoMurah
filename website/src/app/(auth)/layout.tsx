"use client";

import { POSProvider } from "@/lib/pos-context";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <POSProvider>{children}</POSProvider>;
}
