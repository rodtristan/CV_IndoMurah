"use client";

import { useMemo } from "react";
import { KInfoBox } from "@/components/kform";
import { KetokoList, type KListColumn, type KListFilter, type KSortOption } from "@/components/ui/KetokoList";
import type { EntityConfig } from "./types";

/** Daftar master data berbasis konfigurasi, memakai tampilan daftar standar Ketoko (KetokoList). */
export function EntityList({ config }: { config: EntityConfig }) {
  const columns = useMemo<KListColumn[]>(
    () => config.columns.map((c) => ({
      key: c.key, label: c.label, align: c.align, render: c.render, sortKey: c.sortKey,
      width: typeof c.width === "number" ? c.width : c.width ? Number.parseInt(String(c.width), 10) || undefined : undefined,
    })),
    [config],
  );

  // Urut Berdasar: dari konfigurasi, atau semua kolom yang bisa diurutkan.
  const sortOptions = useMemo<KSortOption[]>(
    () => config.sortOptions ?? columns.filter((c) => c.sortKey !== false).map((c) => ({ value: (c.sortKey || c.key) as string, label: c.label })),
    [config, columns],
  );

  const filters = useMemo<KListFilter[]>(
    () => (config.filters ?? []).map((f) => ({ key: f.key, label: f.label, type: "select", options: f.options, where: f.where })),
    [config],
  );

  const searchFields = useMemo(
    () => config.searchFields.map((f) => f.charAt(0).toUpperCase() + f.slice(1)),
    [config],
  );

  if (!config.endpoint) {
    return (
      <KInfoBox variant="warning" title="Penyimpanan belum tersedia di server">
        <p>Modul {config.plural.toLowerCase()} belum memiliki API di server.</p>
      </KInfoBox>
    );
  }

  return (
    <KetokoList
      title={config.plural}
      endpoint={config.endpoint}
      basePath={config.basePath}
      include={config.include}
      searchFields={searchFields}
      searchPlaceholder={config.searchPlaceholder ?? "Cari kode / nama"}
      filters={filters}
      sortOptions={sortOptions}
      defaultSort={config.defaultSort ?? (config.hasCode === false ? sortOptions[0]?.value : "Code")}
      columns={columns}
      emptyMessage={`Tidak ada data ${config.plural.toLowerCase()}`}
    />
  );
}
