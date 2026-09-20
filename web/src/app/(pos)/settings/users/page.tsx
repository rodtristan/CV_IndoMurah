"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { ConfirmModal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";
import { usePageTitle } from "@/lib/page-title";
import { apiError } from "../_lib/local";

interface UserRow { ID: string; Username: string; Name: string; Email?: string | null; Role?: string; IsActive: boolean }

export default function UsersPage() {
  usePageTitle("Daftar User");
  const router = useRouter();
  const [data, setData] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<UserRow[]>("users", { $search: search || undefined, $take: 200 }, { skipCache: true });
      setData(res.data ?? []);
    } catch (e) { toast.error(apiError(e)); } finally { setLoading(false); }
  }, [search]);
  useEffect(() => { void fetchData(); }, [fetchData]);

  const rows = data.filter((u) => (status === "" ? true : status === "1" ? u.IsActive : !u.IsActive));
  const edit = (u: UserRow) => router.push(`/settings/users/${u.ID}`);

  const remove = async () => {
    if (!selected) return;
    if (selected.Username === "admin") { toast.error("User admin tidak dapat dihapus"); setShowDelete(false); return; }
    setBusy(true);
    try {
      await api.delete("users", selected.ID);
      toast.success("User dinonaktifkan");
      setShowDelete(false); setSelected(null); await fetchData();
    } catch (e) { toast.error(apiError(e)); } finally { setBusy(false); }
  };

  const columns = [
    { key: "edit", label: "", width: 36, render: (_: unknown, row: UserRow) => <RowEditIcon onClick={() => edit(row)} /> },
    { key: "Username", label: "User ID" },
    { key: "Name", label: "Nama User" },
    { key: "Email", label: "Email", render: (v: unknown) => (v as string) || "-" },
    { key: "Role", label: "Kelompok User", render: (v: unknown) => <span className="capitalize">{(v as string) || "-"}</span> },
    { key: "IsActive", label: "Status", render: (v: unknown) => v ? <Badge variant="success">Aktif</Badge> : <Badge variant="default">Nonaktif</Badge> },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-3 text-[13px] text-[#3a4654]">
          Daftar user pada program. User &quot;admin&quot; memiliki hak akses paling tinggi; disarankan tidak mengubah hak akses user admin.
        </p>
        <FilterBar
          fields={[
            { key: "search", label: "Kata Kunci", type: "text", placeholder: "User ID / nama..." },
            { key: "status", label: "Status", type: "select", options: [{ value: "", label: "Semua" }, { value: "1", label: "Aktif" }, { value: "0", label: "Nonaktif" }] },
          ]}
          onFilter={(v) => { setSearch((v.search as string) || ""); setStatus((v.status as string) || ""); }}
          loading={loading}
          actions={
            <GridActions
              onAdd={() => router.push("/settings/users/new")}
              onEdit={() => selected && edit(selected)}
              onDelete={() => selected && setShowDelete(true)}
              disableEdit={!selected}
              disableDelete={!selected}
            />
          }
        />
        <div className="mt-4">
          <DataTable data={rows} columns={columns} loading={loading} selectedId={selected?.ID ?? null} onRowClick={setSelected} emptyMessage="Tidak ada user" />
        </div>
      </Card>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={remove}
        title="Hapus User"
        message={`Yakin ingin menghapus (menonaktifkan) user ${selected?.Name ?? ""}?`}
        confirmText="Hapus"
        variant="danger"
        loading={busy}
      />
    </PageWrapper>
  );
}
