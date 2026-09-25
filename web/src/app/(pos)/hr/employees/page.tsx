"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { KeyRound, Smartphone } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { GridActions, RowEditIcon } from "@/components/ui/GridActions";
import { api } from "@/lib/api-client";
import { attendanceAdmin, errorMessage, type AttendanceLocation } from "@/lib/attendance-admin";

const EMPTY_FORM = { id: undefined as number | undefined, code: "", name: "", phone: "", email: "", address: "" };

const EMPTY_ACCOUNT = { username: "", password: "", locationId: "" };

const PAGE_SIZE = 50;

const USERNAME_RE = /^[a-z0-9._-]{3,50}$/;

export default function EmployeesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const [locations, setLocations] = useState<AttendanceLocation[]>([]);
  const [accountFor, setAccountFor] = useState<any>(null);
  const [account, setAccount] = useState(EMPTY_ACCOUNT);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [showRemoveAccount, setShowRemoveAccount] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>(
        "employees",
        {
          $search: search || undefined,
          $include: "Status,Department,Position,AttendanceLocation",
          $orderBy: { Name: "asc" },
          $skip: (page - 1) * PAGE_SIZE,
          $take: PAGE_SIZE,
        },
        { skipCache: true }
      );
      if (res.success) {
        setData(res.data || []);
        setTotal(res.meta?.total ?? (res.data || []).length);
      }
    } catch (e) {
      toast.error(errorMessage(e));
    } finally { setLoading(false); }
  }, [search, page]);

  const fetchLocations = useCallback(async () => {
    try {
      setLocations(await attendanceAdmin.listLocations());
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) { setFormError("Kode dan nama wajib diisi"); return; }
    const payload = { code: form.code.trim(), name: form.name.trim(), phone: form.phone || undefined, email: form.email || undefined, address: form.address || undefined };
    setSaving(true);
    setFormError(null);
    try {
      if (form.id) {
        await api.patch("employees", form.id, payload);
        toast.success("Karyawan diperbarui");
      } else {
        await api.post("employees", payload);
        toast.success("Karyawan ditambahkan");
      }
      setShowForm(false);
      fetchData();
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete("employees", selected.ID);
      toast.success("Karyawan dihapus");
      setShowDelete(false);
      setSelected(null);
      fetchData();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally { setSaving(false); }
  };

  const openEdit = (row: any) => {
    setSelected(row);
    setForm({ id: row.ID, code: row.Code, name: row.Name, phone: row.Phone || "", email: row.Email || "", address: row.Address || "" });
    setFormError(null);
    setShowForm(true);
  };

  // ─── Akun absensi mobile ─────────────────────────────────
  const openAccount = (row: any) => {
    setSelected(row);
    setAccountFor(row);
    setAccount({
      username: row.Username || "",
      password: "",
      locationId: row.AttendanceLocationID ? String(row.AttendanceLocationID) : "",
    });
    setAccountError(null);
    fetchLocations();
  };

  const hasAccount = !!accountFor?.Username;

  const handleSaveAccount = async () => {
    if (!accountFor) return;
    const username = account.username.trim().toLowerCase();
    if (!USERNAME_RE.test(username)) {
      setAccountError("Username 3-50 karakter: huruf kecil, angka, titik, strip, underscore");
      return;
    }
    if (!hasAccount && !account.password) { setAccountError("Password wajib diisi untuk akun baru"); return; }
    if (account.password && account.password.length < 6) { setAccountError("Password minimal 6 karakter"); return; }
    setSaving(true);
    setAccountError(null);
    try {
      await attendanceAdmin.setAccount(accountFor.ID, {
        username,
        password: account.password || undefined,
        attendanceLocationId: account.locationId ? Number(account.locationId) : null,
      });
      toast.success(hasAccount ? "Akun absensi diperbarui" : "Akun absensi dibuat");
      setAccountFor(null);
      fetchData();
    } catch (e) {
      setAccountError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAccount = async () => {
    if (!accountFor) return;
    setSaving(true);
    try {
      await attendanceAdmin.removeAccount(accountFor.ID);
      toast.success("Akun absensi dihapus");
      setShowRemoveAccount(false);
      setAccountFor(null);
      fetchData();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const locationOptions = [
    { value: "", label: "Semua lokasi aktif" },
    ...locations
      .filter((l) => l.IsActive || String(l.ID) === account.locationId)
      .map((l) => ({ value: String(l.ID), label: l.IsActive ? l.Name : `${l.Name} (nonaktif)` })),
  ];

  const columns = [
    { key: "edit", label: "", width: 36, render: (_: unknown, row: any) => <RowEditIcon onClick={() => openEdit(row)} /> },
    { key: "Code", label: "Kode", render: (v: unknown) => <span className="font-mono text-xs">{v as string}</span> },
    { key: "Name", label: "Nama" },
    { key: "Department.Name", label: "Departemen", render: (v: unknown) => (v as string) || "-" },
    { key: "Phone", label: "Telepon", render: (v: unknown) => (v as string) || "-" },
    {
      key: "Username",
      label: "Akun Mobile",
      render: (v: unknown) =>
        v ? (
          <span className="inline-flex items-center gap-1 font-mono text-xs text-primary">
            <Smartphone className="size-3.5" />
            {v as string}
          </span>
        ) : (
          <span className="text-muted">-</span>
        ),
    },
    {
      key: "AttendanceLocation.Name",
      label: "Lokasi Absen",
      render: (v: unknown, row: any) =>
        row.Username ? (v as string) || <span className="text-toned">Semua lokasi</span> : <span className="text-muted">-</span>,
    },
    { key: "Status", label: "Status", render: (_: unknown, row: any) => <Badge variant={row.Status?.Code === "ACTIVE" ? "success" : "default"}>{row.Status?.Name || "-"}</Badge> },
    {
      key: "actions",
      label: "",
      render: (_: unknown, row: any) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); openAccount(row); }}
          className="inline-flex h-7 items-center gap-1 rounded border border-default px-2 text-xs text-highlighted transition-colors hover:border-primary hover:text-primary"
          title="Atur akun aplikasi absensi"
        >
          <KeyRound className="size-3.5" />
          Akun Absensi
        </button>
      ),
    },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <FilterBar
          fields={[{ key: "search", label: "Kata Kunci", type: "text", placeholder: "Cari karyawan..." }]}
          onFilter={(v) => { setPage(1); setSearch((v.search as string) || ""); }}
          onReset={() => { setPage(1); setSearch(""); }}
          loading={loading}
          actions={
            <GridActions
              onAdd={() => { setForm(EMPTY_FORM); setFormError(null); setShowForm(true); }}
              onEdit={() => selected && openEdit(selected)}
              onDelete={() => selected && setShowDelete(true)}
              disableEdit={!selected}
              disableDelete={!selected}
            />
          }
        />
        <div className="mt-4">
          <DataTable data={data} columns={columns} loading={loading} selectedId={selected?.ID ?? null} onRowClick={setSelected} emptyMessage="Belum ada data karyawan"
            pagination={{ page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE), onPageChange: setPage }}
          />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={form.id ? "Ubah Karyawan" : "Tambah Karyawan"} size="sm"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}
      >
        <div className="space-y-4">
          <Input label="Kode" required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <Input label="Nama" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Telepon" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Alamat" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          {formError && <div className="rounded border border-danger/30 bg-danger/5 px-3 py-2 text-[13px] text-danger">{formError}</div>}
        </div>
      </Modal>

      <Modal
        open={!!accountFor && !showRemoveAccount}
        onClose={() => !saving && setAccountFor(null)}
        title="Akun Absensi Mobile"
        size="sm"
        footer={
          <>
            {hasAccount && (
              <Button variant="danger" className="mr-auto" onClick={() => setShowRemoveAccount(true)} disabled={saving}>
                Hapus Akun
              </Button>
            )}
            <Button variant="outline" onClick={() => setAccountFor(null)} disabled={saving}>Batal</Button>
            <Button variant="primary" onClick={handleSaveAccount} loading={saving}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded border border-default bg-bg px-3 py-2 text-[13px]">
            <div className="font-medium text-highlighted">{accountFor?.Name}</div>
            <div className="text-xs text-toned">
              {accountFor?.Code} · {hasAccount ? "Sudah memiliki akun" : "Belum memiliki akun"}
            </div>
          </div>
          <Input
            label="Username"
            required
            autoComplete="off"
            value={account.username}
            onChange={(e) => setAccount((a) => ({ ...a, username: e.target.value.toLowerCase() }))}
            hint="3-50 karakter: huruf kecil, angka, titik, strip, underscore"
          />
          <Input
            label="Password"
            type="password"
            required={!hasAccount}
            autoComplete="new-password"
            value={account.password}
            placeholder={hasAccount ? "Kosongkan bila tidak diubah" : "Minimal 6 karakter"}
            onChange={(e) => setAccount((a) => ({ ...a, password: e.target.value }))}
            hint={hasAccount ? "Kosongkan bila tidak diubah" : "Minimal 6 karakter"}
          />
          <Select
            label="Lokasi Absen"
            value={account.locationId}
            onChange={(e) => setAccount((a) => ({ ...a, locationId: e.target.value }))}
            options={locationOptions}
            hint="Semua lokasi aktif: karyawan boleh absen di kantor mana pun yang aktif"
          />
          {accountError && <div className="rounded border border-danger/30 bg-danger/5 px-3 py-2 text-[13px] text-danger">{accountError}</div>}
        </div>
      </Modal>

      <ConfirmModal
        open={showRemoveAccount}
        onClose={() => setShowRemoveAccount(false)}
        onConfirm={handleRemoveAccount}
        title="Hapus Akun Absensi"
        message={`Hapus akun mobile "${accountFor?.Username ?? ""}" milik ${accountFor?.Name ?? ""}? Karyawan tidak bisa lagi login ke aplikasi absensi. Riwayat absensi tetap tersimpan.`}
        confirmText="Hapus Akun"
        variant="danger"
        loading={saving}
      />

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Karyawan"
        message={`Yakin ingin menghapus karyawan ${selected?.Name ?? ""}?`}
        confirmText="Hapus"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}
