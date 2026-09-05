"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Copy,
  List,
  Wallet,
  Trash,
  EllipsisVertical,
  Search,
  Settings2,
} from "lucide-react";
import { Navbar } from "@/components/layout/PageHeader";
import { SidebarCollapseButton } from "@/components/layout/SidebarCollapseButton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeColor } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Checkbox } from "@/components/ui/Checkbox";
import { Kbd } from "@/components/ui/Kbd";
import { Pagination } from "@/components/ui/Pagination";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { AddModal } from "./AddModal";
import { DeleteModal } from "./DeleteModal";
import { useToast } from "@/lib/toast-context";
import { customers } from "@/lib/mock-data";
import type { User, UserStatus } from "@/types";

const statusColor: Record<UserStatus, BadgeColor> = {
  subscribed: "success",
  unsubscribed: "error",
  bounced: "warning",
};

type ColumnId = "name" | "email" | "location" | "status";
const columnLabels: Record<ColumnId, string> = {
  name: "Name",
  email: "Email",
  location: "Location",
  status: "Status",
};

const PAGE_SIZE = 10;

export function CustomersView() {
  const toast = useToast();
  const [emailFilter, setEmailFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set([1]));
  const [page, setPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnId, boolean>>({
    name: true,
    email: true,
    location: true,
    status: true,
  });

  const filtered = useMemo(() => {
    let rows: User[] = customers;
    if (emailFilter) {
      rows = rows.filter((c) => c.email.toLowerCase().includes(emailFilter.toLowerCase()));
    }
    if (statusFilter !== "all") {
      rows = rows.filter((c) => c.status === statusFilter);
    }
    if (sortDir) {
      rows = [...rows].sort((a, b) =>
        sortDir === "asc" ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email),
      );
    }
    return rows;
  }, [emailFilter, statusFilter, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const allOnPageSelected = paginated.length > 0 && paginated.every((c) => selected.has(c.id));
  const someOnPageSelected = paginated.some((c) => selected.has(c.id));

  function toggleAll(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const c of paginated) {
        if (checked) next.add(c.id);
        else next.delete(c.id);
      }
      return next;
    });
  }

  function toggleRow(id: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function rowItems(row: User): DropdownItem[][] {
    return [
      [{ type: "label", label: "Actions" }],
      [
        {
          label: "Copy customer ID",
          icon: Copy,
          onSelect: () => {
            navigator.clipboard?.writeText(row.id.toString());
            toast.add({ title: "Copied to clipboard", description: "Customer ID copied to clipboard" });
          },
        },
      ],
      [
        { label: "View customer details", icon: List },
        { label: "View customer payments", icon: Wallet },
      ],
      [
        {
          label: "Delete customer",
          icon: Trash,
          color: "error",
          onSelect: () => toast.add({ title: "Customer deleted", description: "The customer has been deleted.", color: "success" }),
        },
      ],
    ];
  }

  const displayItems: DropdownItem[][] = [
    (Object.keys(columnLabels) as ColumnId[]).map((id) => ({
      label: columnLabels[id],
      type: "checkbox",
      checked: visibleColumns[id],
      onCheckedChange: (checked) => setVisibleColumns((v) => ({ ...v, [id]: checked })),
    })),
  ];

  return (
    <div className="flex w-full min-w-0 flex-col overflow-hidden">
      <Navbar title="Customers" leading={<SidebarCollapseButton />} right={<AddModal />} />

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <Input
              icon={Search}
              placeholder="Filter emails..."
              className="max-w-sm"
              value={emailFilter}
              onChange={(e) => {
                setEmailFilter(e.target.value);
                setPage(1);
              }}
            />

            <div className="flex flex-wrap items-center gap-1.5">
              {selected.size > 0 && (
                <DeleteModal count={selected.size}>
                  <Button color="error" variant="subtle" icon={Trash} label="Delete">
                    <Kbd className="ml-1.5">{selected.size}</Kbd>
                  </Button>
                </DeleteModal>
              )}

              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { label: "All", value: "all" },
                  { label: "Subscribed", value: "subscribed" },
                  { label: "Unsubscribed", value: "unsubscribed" },
                  { label: "Bounced", value: "bounced" },
                ]}
                className="min-w-28"
              />

              <Dropdown sections={displayItems} align="end" widthClassName="w-44">
                <Button label="Display" color="neutral" variant="outline" trailingIcon={Settings2} />
              </Dropdown>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-default">
            <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
              <thead className="bg-elevated/50">
                <tr>
                  <th className="w-10 border-b border-default px-4 py-2">
                    <Checkbox
                      checked={allOnPageSelected}
                      indeterminate={!allOnPageSelected && someOnPageSelected}
                      onChange={toggleAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="w-14 border-b border-default px-2 py-2 text-left font-medium text-muted">ID</th>
                  {visibleColumns.name && (
                    <th className="border-b border-default px-2 py-2 text-left font-medium text-muted">Name</th>
                  )}
                  {visibleColumns.email && (
                    <th className="border-b border-default px-2 py-2 text-left font-medium text-muted">
                      <button
                        type="button"
                        onClick={() => setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc")}
                        className="-mx-2.5 flex items-center gap-1.5 rounded-md px-2.5 py-1 hover:bg-elevated"
                      >
                        Email
                        {sortDir === "asc" && <ArrowUpNarrowWide className="size-4" />}
                        {sortDir === "desc" && <ArrowDownWideNarrow className="size-4" />}
                        {!sortDir && <ArrowUpDown className="size-4" />}
                      </button>
                    </th>
                  )}
                  {visibleColumns.location && (
                    <th className="border-b border-default px-2 py-2 text-left font-medium text-muted">Location</th>
                  )}
                  {visibleColumns.status && (
                    <th className="border-b border-default px-2 py-2 text-left font-medium text-muted">Status</th>
                  )}
                  <th className="w-10 border-b border-default px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {paginated.map((row) => (
                  <tr key={row.id}>
                    <td className="border-b border-default px-4 py-2.5">
                      <Checkbox
                        checked={selected.has(row.id)}
                        onChange={(checked) => toggleRow(row.id, checked)}
                        aria-label="Select row"
                      />
                    </td>
                    <td className="border-b border-default px-2 py-2.5 text-toned">{row.id}</td>
                    {visibleColumns.name && (
                      <td className="border-b border-default px-2 py-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar src={row.avatar?.src} alt={row.name} size="lg" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-highlighted">{row.name}</p>
                            <p className="truncate text-muted">@{row.name.replace(/\s+/g, "").toLowerCase()}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.email && (
                      <td className="truncate border-b border-default px-2 py-2.5 text-toned">{row.email}</td>
                    )}
                    {visibleColumns.location && (
                      <td className="truncate border-b border-default px-2 py-2.5 text-toned">{row.location}</td>
                    )}
                    {visibleColumns.status && (
                      <td className="border-b border-default px-2 py-2.5">
                        <Badge color={statusColor[row.status]} variant="subtle" className="capitalize">
                          {row.status}
                        </Badge>
                      </td>
                    )}
                    <td className="border-b border-default px-2 py-2.5 text-right">
                      <Dropdown sections={rowItems(row)} align="end">
                        <button type="button" className="flex size-8 items-center justify-center rounded-md text-toned hover:bg-elevated">
                          <EllipsisVertical className="size-4" />
                        </button>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="border-b border-default px-4 py-8 text-center text-sm text-muted">
                      No results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-default pt-4">
            <div className="text-sm text-muted">
              {[...selected].filter((id) => filtered.some((c) => c.id === id)).length} of {filtered.length} row(s) selected.
            </div>
            <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
