"use client";

import { Button } from "@/components/ui/Button";
import { House } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">Page not found</h1>
      <p className="max-w-sm text-muted">We are sorry but this page could not be found.</p>
      <Button href="/" icon={House} label="Back to home" />
    </div>
  );
}
