"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin } from "lucide-react";
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
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Hadir" },
  { value: "LATE", label: "Terlambat" },
  { value: "ABSENT", label: "Tidak Hadir" },
  { value: "LEAVE", label: "Cuti" },
  { value: "SICK", label: "Sakit" },
  { value: "PERMIT", label: "Izin" },
];

const STATUS_VARIANT: Record<string, "success" | "danger" | "warning" | "info" | "default"> = {
  PRESENT: "success",
  LATE: "warning",
  ABSENT: "danger",
  LEAVE: "info",
  SICK: "info",
  PERMIT: "default",
};

const EMPTY_FORM = {
  id: undefined as number | undefined,
  employeeId: "",
  date: new Date().toISOString().split("T")[0],
  checkIn: "",
  checkOut: "",
  statusCode: "PRESENT",
  notes: "",
};

function timeToDateTime(date: string, time: string): string | undefined {
  if (!time) return undefined;
  return `${date}T${time}:00`;
}

export default function AttendancePage() {
  const [rows, setRows] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState<any>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchEmployees = useCallback(async () => {
    const res = await api.get("employees", { $select: "ID,Code,Name", $take: 200 } as any).catch(() => ({ success: false, data: [] } as any));
    if (res.success) setEmployees(res.data || []);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const where: any = {};
      if (employeeFilter) where.employeeId = Number(employeeFilter);
      if (dateFrom) where.date = { ...where.date, gte: new Date(dateFrom) };
      if (dateTo) where.date = { ...where.date, lte: new Date(dateTo + "T23:59:59") };
      const res = await api.get("attendances", {
        $include: "Employee,Status",
        $orderBy: { date: "desc" },
        $take: 100,
        $where: where,
      } as any).catch(() => ({ success: false, data: [] } as any));
      if (res.success) setRows(res.data || []);
    } finally { setLoading(false); }
  }, [employeeFilter, dateFrom, dateTo]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!form.employeeId) return;
    const payload = {
      employeeId: Number(form.employeeId),
      date: form.date,
      checkIn: timeToDateTime(form.date, form.checkIn),
      checkOut: timeToDateTime(form.date, form.checkOut),
      statusCode: form.statusCode,
      notes: form.notes || undefined,
    };
    setSaving(true);
    if (form.id) {
      await api.patch("attendances", form.id, payload).catch(() => ({}));
    } else {
      await api.post("attendances", payload).catch(() => ({}));
    }
    setSaving(false);
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete("attendances", selected.ID).catch(() => ({}));
      setShowDelete(false);
      setSelected(null);
      fetchData();
    } finally { setSaving(false); }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setShowForm(true); };
  const openCopy = (row: any) => {
    setForm({
      id: undefined,
      employeeId: String(row.EmployeeID),
      date: new Date().toISOString().split("T")[0],
      checkIn: row.CheckIn ? row.CheckIn.split("T")[1]?.slice(0, 5) : "",
      checkOut: row.CheckOut ? row.CheckOut.split("T")[1]?.slice(0, 5) : "",
      statusCode: row.Status?.Code || "PRESENT",
      notes: row.Notes || "",
    });
    setShowForm(true);
  };
  const openEdit = (row: any) => {
    setSelected(row);
    setForm({
      id: row.ID,
      employeeId: String(row.EmployeeID),
      date: row.Date ? row.Date.split("T")[0] : "",
      checkIn: row.CheckIn ? row.CheckIn.split("T")[1]?.slice(0, 5) : "",
      checkOut: row.CheckOut ? row.CheckOut.split("T")[1]?.slice(0, 5) : "",
      statusCode: row.Status?.Code || "PRESENT",
      notes: row.Notes || "",
    });
    setShowForm(true);
  };

  const mapLink = (lat: unknown, lng: unknown) =>
    lat != null && lng != null ? `https://maps.google.com/?q=${lat},${lng}` : null;

  const columns = [
    { key: "edit", label: "", width: 36, render: (_: unknown, row: any) => <RowEditIcon onClick={() => openEdit(row)} /> },
    { key: "Date", label: "Tanggal", render: (v: unknown) => formatDate(v as string) },
    { key: "Employee", label: "Karyawan", render: (_: unknown, row: any) => row.Employee?.Name || "-" },
    { key: "CheckIn", label: "Jam Masuk", render: (_: unknown, row: any) => (
        <div className="flex items-center gap-1">
          {row.CheckIn ? new Date(row.CheckIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
          {mapLink(row.CheckInLatitude, row.CheckInLongitude) && (
            <a href={mapLink(row.CheckInLatitude, row.CheckInLongitude)!} target="_blank" rel="noreferrer" title="Lihat lokasi check-in">
              <MapPin className="size-3.5 text-primary" />
            </a>
          )}
        </div>
      ) },
    { key: "CheckOut", label: "Jam Keluar", render: (_: unknown, row: any) => (
        <div className="flex items-center gap-1">
          {row.CheckOut ? new Date(row.CheckOut).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
          {mapLink(row.CheckOutLatitude, row.CheckOutLongitude) && (
            <a href={mapLink(row.CheckOutLatitude, row.CheckOutLongitude)!} target="_blank" rel="noreferrer" title="Lihat lokasi check-out">
              <MapPin className="size-3.5 text-primary" />
            </a>
          )}
        </div>
      ) },
    { key: "Status", label: "Status", render: (_: unknown, row: any) => <Badge variant={STATUS_VARIANT[row.Status?.Code] || "default"}>{row.Status?.Name || "-"}</Badge> },
    { key: "Notes", label: "Catatan", render: (v: unknown) => (v as string) || <span className="text-muted">-</span> },
  ];

  return (
    <PageWrapper>
      <Card className="p-4">
        <p className="mb-4 text-sm text-muted">
          Absensi karyawan. Saat ini pencatatan dilakukan manual dari sini; ke depan
          akan tersedia aplikasi mobile untuk check-in/check-out otomatis dengan
          validasi lokasi (GPS) dan jam server, dan data lokasinya akan tampil
          di sini lewat ikon peta pada baris yang tercatat dari mobile.
        </p>
        <FilterBar
          fields={[
            { key: "employeeId", label: "Karyawan", type: "select", options: [{ value: "", label: "Semua Karyawan" }, ...employees.map((e) => ({ value: String(e.ID), label: `${e.Code} - ${e.Name}` }))] },
            { key: "dateFrom", label: "Dari Tanggal", type: "date" },
            { key: "dateTo", label: "Sampai Tanggal", type: "date" },
          ]}
          onFilter={(v) => {
            setEmployeeFilter((v.employeeId as string) || "");
            setDateFrom((v.dateFrom as string) || "");
            setDateTo((v.dateTo as string) || "");
          }}
          onReset={() => { setEmployeeFilter(""); setDateFrom(""); setDateTo(""); }}
          loading={loading}
          actions={
            <GridActions
              onAdd={openCreate}
              onEdit={() => selected && openEdit(selected)}
              onCopy={() => selected && openCopy(selected)}
              onDelete={() => selected && setShowDelete(true)}
              disableEdit={!selected}
              disableCopy={!selected}
              disableDelete={!selected}
            />
          }
        />
        <div className="mt-4">
          <DataTable data={rows} columns={columns} loading={loading} selectedId={selected?.ID ?? null} onRowClick={setSelected} emptyMessage="Tidak ada data absensi" />
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={form.id ? "Edit Absensi" : "Tambah Absensi"} size="md"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button></>}
      >
        <div className="space-y-4">
          <Select
            label="Karyawan *"
            value={form.employeeId}
            onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
            options={[{ value: "", label: "Pilih karyawan..." }, ...employees.map((e) => ({ value: String(e.ID), label: `${e.Code} - ${e.Name}` }))]}
          />
          <Input type="date" label="Tanggal" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input type="time" label="Jam Masuk" value={form.checkIn} onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))} />
            <Input type="time" label="Jam Keluar" value={form.checkOut} onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))} />
          </div>
          <Select
            label="Status"
            value={form.statusCode}
            onChange={(e) => setForm((f) => ({ ...f, statusCode: e.target.value }))}
            options={STATUS_OPTIONS}
          />
          <Input label="Catatan" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
      </Modal>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Absensi"
        message={`Yakin ingin menghapus data absensi ${selected?.Employee?.Name ?? ""}?`}
        confirmText="Hapus"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}
