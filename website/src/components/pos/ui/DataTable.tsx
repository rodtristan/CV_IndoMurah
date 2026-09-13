"use client";

import { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TableColumn, TableSort } from "@/types/pos";

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  selectable?: boolean;
  selectedRows?: number[];
  onSelectRow?: (id: number) => void;
  onSelectAll?: (selected: boolean) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id?: number }>({
  data,
  columns,
  page = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  onSort,
  sortKey,
  sortDirection,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  loading = false,
  emptyMessage = "Tidak ada data",
  className,
}: DataTableProps<T>) {
  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : 1;

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable || !onSort) return;
    const newDirection =
      sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    onSort(key, newDirection);
  };

  const getSortIcon = (key: string, sortable?: boolean) => {
    if (!sortable) return null;
    if (sortKey !== key) return <ChevronsUpDown className="size-4 text-dimmed" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="size-4" />
    ) : (
      <ChevronDown className="size-4" />
    );
  };

  const isAllSelected =
    selectable && data.length > 0 && data.every((row) => selectedRows.includes(row.id!));
  const isSomeSelected =
    selectable && data.some((row) => selectedRows.includes(row.id!)) && !isAllSelected;

  return (
    <div className={cn("overflow-hidden rounded-lg border border-default", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-elevated">
            <tr>
              {selectable && (
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="size-4 cursor-pointer rounded-sm border-default text-primary accent-[var(--color-primary)]"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className={cn(
                    "px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.sortable && "cursor-pointer select-none hover:text-toned"
                  )}
                  style={{ width: col.width }}
                  onClick={() => handleSort(col.key as string, col.sortable)}
                >
                  <div className={cn("flex items-center gap-1", col.align === "center" && "justify-center", col.align === "right" && "justify-end")}>
                    {col.label}
                    {getSortIcon(col.key as string, col.sortable)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-default bg-bg">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-3 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted">
                    <div className="size-5 animate-spin rounded-full border-2 border-default border-t-primary" />
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-3 py-12 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-elevated/50">
                  {selectable && (
                    <td className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id!)}
                        onChange={() => onSelectRow?.(row.id!)}
                        className="size-4 cursor-pointer rounded-sm border-default text-primary accent-[var(--color-primary)]"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key as string}
                      className={cn(
                        "whitespace-nowrap px-3 py-3 text-sm",
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right"
                      )}
                    >
                      {col.render
                        ? col.render((row as Record<string, unknown>)[col.key as string], row)
                        : String((row as Record<string, unknown>)[col.key as string] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems !== undefined && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-default bg-elevated px-4 py-3">
          <div className="text-sm text-muted">
            Menampilkan {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalItems)} dari {totalItems}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
              className="rounded p-1 hover:bg-default disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="size-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={cn(
                    "min-w-[32px] rounded px-2 py-1 text-sm",
                    page === pageNum
                      ? "bg-primary text-white"
                      : "hover:bg-default"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
              className="rounded p-1 hover:bg-default disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
