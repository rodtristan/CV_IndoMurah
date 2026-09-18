"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: unknown, row: T, index: number) => any;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedId?: number | string | null;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
}

function PageNav({
  pagination,
}: {
  pagination: NonNullable<DataTableProps<unknown>["pagination"]>;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => pagination.onPageChange(pagination.page - 1)}
        disabled={pagination.page === 1}
        className="flex size-7 items-center justify-center rounded border border-default text-toned transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="size-3.5" />
      </button>
      <span className="text-[13px] text-toned">
        Hal {pagination.page} / {Math.max(pagination.totalPages, 1)}
      </span>
      <button
        onClick={() => pagination.onPageChange(pagination.page + 1)}
        disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
        className="flex size-7 items-center justify-center rounded border border-default text-toned transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}

export function DataTable<T = any>({
  data,
  columns,
  loading,
  emptyMessage = "Tidak ada data",
  onRowClick,
  selectedId,
  pagination,
}: DataTableProps<T>) {
  return (
    <div className="space-y-2">
      {pagination && pagination.totalPages > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageNav pagination={pagination} />
          <p className="text-[13px] text-toned">
            Total data yang ditemukan:{" "}
            <span className="font-semibold text-highlighted">{pagination.total.toLocaleString("id-ID")}</span>
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded border border-default">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-default bg-[#f5f6f8]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-3 py-2.5 text-left font-semibold text-gray-600",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right"
                  )}
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-default last:border-b-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2.5">
                      <div className="h-3.5 w-full animate-pulse rounded bg-bg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const record = row as Record<string, unknown>;
                const rowId = record["id"] ?? record["ID"];
                const isSelected = selectedId !== undefined && rowId === selectedId;

                return (
                  <tr
                    key={rowId !== undefined && rowId !== null ? String(rowId) : index}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "border-b border-default transition-colors last:border-b-0",
                      onRowClick && "cursor-pointer",
                      isSelected ? "bg-primary/5" : "hover:bg-[#f5f6f8]"
                    )}
                  >
                    {columns.map((col) => {
                      const value = col.key.includes(".")
                        ? col.key.split(".").reduce((obj: any, key: string) => obj?.[key], row)
                        : (row as Record<string, unknown>)[col.key];

                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "whitespace-nowrap px-3 py-2.5 text-[#1e293b]",
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right"
                          )}
                        >
                          {col.render
                            ? col.render(value, row, index)
                            : value !== undefined && value !== null
                            ? String(value)
                            : "-"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageNav pagination={pagination} />
          <p className="text-[13px] text-toned">
            Menampilkan{" "}
            <span className="font-medium text-highlighted">
              {(pagination.page - 1) * pagination.pageSize + 1}
            </span>{" "}
            -{" "}
            <span className="font-medium text-highlighted">
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </span>{" "}
            dari <span className="font-medium text-highlighted">{pagination.total}</span>
          </p>
        </div>
      )}
    </div>
  );
}
