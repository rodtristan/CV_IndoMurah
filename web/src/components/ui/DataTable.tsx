"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { ReactNode } from "react";

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
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-default">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-default bg-elevated/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted",
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
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-default">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-elevated" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowId = (row as Record<string, unknown>)["id"];
                const isSelected = selectedId !== undefined && rowId === selectedId;

                return (
                  <tr
                    key={String(rowId) || index}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "border-b border-default transition-colors",
                      onRowClick && "cursor-pointer hover:bg-elevated/50",
                      isSelected && "bg-primary/5"
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
                            "whitespace-nowrap px-4 py-3 text-highlighted",
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Menampilkan{" "}
            <span className="font-medium text-highlighted">
              {(pagination.page - 1) * pagination.pageSize + 1}
            </span>{" "}
            -{" "}
            <span className="font-medium text-highlighted">
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </span>{" "}
            dari{" "}
            <span className="font-medium text-highlighted">{pagination.total}</span>
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
              className="flex size-8 items-center justify-center rounded-lg border border-default text-muted transition-colors hover:bg-elevated hover:text-highlighted disabled:opacity-50"
            >
              <ChevronsLeft className="size-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="flex size-8 items-center justify-center rounded-lg border border-default text-muted transition-colors hover:bg-elevated hover:text-highlighted disabled:opacity-50"
            >
              <ChevronLeft className="size-4" />
            </button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
              let page: number;
              const total = pagination.totalPages;
              const current = pagination.page;

              if (total <= 5) {
                page = i + 1;
              } else if (current <= 3) {
                page = i + 1;
              } else if (current >= total - 2) {
                page = total - 4 + i;
              } else {
                page = current - 2 + i;
              }

              return (
                <button
                  key={page}
                  onClick={() => pagination.onPageChange(page)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg border border-default text-sm transition-colors",
                    page === current
                      ? "border-primary bg-primary text-white"
                      : "text-muted hover:bg-elevated hover:text-highlighted"
                  )}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="flex size-8 items-center justify-center rounded-lg border border-default text-muted transition-colors hover:bg-elevated hover:text-highlighted disabled:opacity-50"
            >
              <ChevronRight className="size-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="flex size-8 items-center justify-center rounded-lg border border-default text-muted transition-colors hover:bg-elevated hover:text-highlighted disabled:opacity-50"
            >
              <ChevronsRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
