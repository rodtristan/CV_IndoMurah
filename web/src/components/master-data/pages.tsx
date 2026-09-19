"use client";

import { Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import { EntityForm } from "./EntityForm";
import type { EntityConfig } from "./types";

function NewInner({ config }: { config: EntityConfig }) {
  const copy = useSearchParams().get("copy") ?? undefined;
  return <EntityForm key={copy ?? "new"} config={config} copyFrom={copy} />;
}

export function EntityNewPage({ config }: { config: EntityConfig }) {
  return <Suspense fallback={null}><NewInner config={config} /></Suspense>;
}

export function EntityEditPage({ config, params }: { config: EntityConfig; params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EntityForm key={id} config={config} id={id} />;
}
