"use client";

import { Suspense } from "react";
import { Designer } from "@/components/report/designer/Designer";

export default function ReportDesignPage() {
  return (
    <Suspense fallback={null}>
      <Designer />
    </Suspense>
  );
}
