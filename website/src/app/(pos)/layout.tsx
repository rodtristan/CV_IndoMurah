import type { ReactNode } from "react";
import { POSProvider } from "@/lib/pos-context";
import { PosLayout } from "@/components/pos/layout/PosLayout";

export default function POSLayout({ children }: { children: ReactNode }) {
  return (
    <POSProvider>
      <PosLayout>{children}</PosLayout>
    </POSProvider>
  );
}
