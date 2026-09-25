"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Crosshair, MapPin, Search } from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { GridActions, RowEditIcon, RowDeleteIcon } from "@/components/ui/GridActions";
import {
  attendanceAdmin,
  errorMessage,
  type AttendanceLocation,
  type LocationPayload,
} from "@/lib/attendance-admin";

const LocationMapPicker = dynamic(() => import("@/components/hr/LocationMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 w-full items-center justify-center rounded border border-default bg-bg text-sm text-muted">
      Memuat peta...
    </div>
  ),
});

// Titik awal untuk lokasi baru (Monas, Jakarta).
const DEFAULT_LAT = -6.1754;
const DEFAULT_LNG = 106.8272;

interface FormState {
  id?: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  radiusMeters: string;
  workStart: string;
  workEnd: string;
  lateToleranceMinutes: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  address: "",
  latitude: String(DEFAULT_LAT),
  longitude: String(DEFAULT_LNG),
  radiusMeters: "100",
  workStart: "08:00",
  workEnd: "17:00",
  lateToleranceMinutes: "0",
  isActive: true,
};

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function validate(f: FormState): string | null {
  if (!f.name.trim()) return "Nama lokasi wajib diisi";
  const lat = Number(f.latitude);
  const lng = Number(f.longitude);
  if (f.latitude.trim() === "" || !Number.isFinite(lat) || lat < -90 || lat > 90) return "Latitude tidak valid (-90 s/d 90)";
  if (f.longitude.trim() === "" || !Number.isFinite(lng) || lng < -180 || lng > 180) return "Longitude tidak valid (-180 s/d 180)";
  const r = Number(f.radiusMeters);
  if (!Number.isInteger(r) || r < 10 || r > 5000) return "Radius harus bilangan bulat 10 - 5000 meter";
  if (!TIME_RE.test(f.workStart)) return "Jam masuk tidak valid (HH:mm)";
  if (!TIME_RE.test(f.workEnd)) return "Jam pulang tidak valid (HH:mm)";
  const t = Number(f.lateToleranceMinutes);
  if (!Number.isInteger(t) || t < 0 || t > 240) return "Toleransi terlambat harus 0 - 240 menit";
  return null;
}

export default function AttendanceLocationsPage() {
  const [data, setData] = useState<AttendanceLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AttendanceLocation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [focusToken, setFocusToken] = useState(0);

  // Pencarian alamat (Nominatim) — hanya saat tombol Cari / Enter ditekan.
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<NominatimResult[] | null>(null);
  const lastSearchAt = useRef(0);
  const [locating, setLocating] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setData(await attendanceAdmin.listLocations());
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setQuery("");
    setResults(null);
    setShowForm(true);
  };

  const openEdit = (row: AttendanceLocation) => {
    setSelected(row);
    setForm({
      id: row.ID,
      name: row.Name,
      address: row.Address || "",
      latitude: String(Number(row.Latitude)),
      longitude: String(Number(row.Longitude)),
      radiusMeters: String(row.RadiusMeters),
      workStart: row.WorkStart,
      workEnd: row.WorkEnd,
      lateToleranceMinutes: String(row.LateToleranceMinutes),
      isActive: row.IsActive,
    });
    setFormError(null);
    setQuery("");
    setResults(null);
    setShowForm(true);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setPoint = (lat: number, lng: number, focus = false) => {
    setForm((f) => ({ ...f, latitude: String(lat), longitude: String(lng) }));
    if (focus) setFocusToken((t) => t + 1);
  };

  const handleSearch = async () => {
    const q = query.trim();
    if (q.length < 3) { toast.error("Ketik minimal 3 karakter untuk mencari alamat"); return; }
    // Kebijakan Nominatim: maks. 1 request/detik, tanpa autocomplete.
    const wait = 1000 - (Date.now() - lastSearchAt.current);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastSearchAt.current = Date.now();
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=id&q=${encodeURIComponent(q)}`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error(`Pencarian alamat gagal (HTTP ${res.status})`);
      const list = (await res.json()) as NominatimResult[];
      setResults(list);
      if (list.length === 0) toast.info("Alamat tidak ditemukan");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSearching(false);
    }
  };

  const pickResult = (r: NominatimResult) => {
    const lat = Math.round(Number(r.lat) * 1e7) / 1e7;
    const lng = Math.round(Number(r.lon) * 1e7) / 1e7;
    setPoint(lat, lng, true);
    setForm((f) => (f.address.trim() ? f : { ...f, address: r.display_name.slice(0, 500) }));
    setResults(null);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { toast.error("Browser tidak mendukung geolokasi"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setPoint(Math.round(pos.coords.latitude * 1e7) / 1e7, Math.round(pos.coords.longitude * 1e7) / 1e7, true);
        if (pos.coords.accuracy > 100) {
          toast.warning(`Akurasi GPS rendah (±${Math.round(pos.coords.accuracy)} m). Periksa kembali titik di peta.`);
        }
      },
      (err) => {
        setLocating(false);
        toast.error(err.code === err.PERMISSION_DENIED ? "Izin lokasi ditolak browser" : "Gagal mendapatkan lokasi saat ini");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSave = async () => {
    const err = validate(form);
    setFormError(err);
    if (err) return;
    const payload: LocationPayload = {
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      radiusMeters: Number(form.radiusMeters),
      workStart: form.workStart,
      workEnd: form.workEnd,
      lateToleranceMinutes: Number(form.lateToleranceMinutes),
      isActive: form.isActive,
    };
    setSaving(true);
    try {
      if (form.id) {
        await attendanceAdmin.updateLocation(form.id, payload);
        toast.success("Lokasi absensi diperbarui");
      } else {
        await attendanceAdmin.createLocation(payload);
        toast.success("Lokasi absensi ditambahkan");
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
      const res = await attendanceAdmin.deleteLocation(selected.ID);
      if (res?.deactivated) {
        toast.info(`Lokasi "${selected.Name}" dinonaktifkan karena sudah memiliki riwayat absensi`);
      } else {
        toast.success("Lokasi absensi dihapus");
        setSelected(null);
      }
      setShowDelete(false);
      fetchData();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      { key: "edit", label: "", width: 36, render: (_: unknown, row: AttendanceLocation) => <RowEditIcon onClick={() => openEdit(row)} /> },
      {
        key: "Name",
        label: "Nama Lokasi",
        render: (_: unknown, row: AttendanceLocation) => (
          <div>
            <div className="font-medium">{row.Name}</div>
            <div className="text-[11px] text-muted">
              {Number(row.Latitude).toFixed(6)}, {Number(row.Longitude).toFixed(6)}
            </div>
          </div>
        ),
      },
      {
        key: "Address",
        label: "Alamat",
        render: (v: unknown) => (
          <span className="block max-w-xs truncate whitespace-normal text-xs text-toned" title={(v as string) || ""}>
            {(v as string) || "-"}
          </span>
        ),
      },
      { key: "RadiusMeters", label: "Radius", align: "right" as const, render: (v: unknown) => `${v} m` },
      { key: "WorkStart", label: "Jam Kerja", render: (_: unknown, row: AttendanceLocation) => `${row.WorkStart} - ${row.WorkEnd}` },
      { key: "LateToleranceMinutes", label: "Toleransi", align: "right" as const, render: (v: unknown) => `${v} menit` },
      { key: "_count.Employees", label: "Karyawan", align: "right" as const, render: (v: unknown) => String(v ?? 0) },
      {
        key: "IsActive",
        label: "Status",
        render: (v: unknown) => <Badge variant={v ? "success" : "default"}>{v ? "Aktif" : "Nonaktif"}</Badge>,
      },
      {
        key: "actions",
        label: "",
        width: 36,
        render: (_: unknown, row: AttendanceLocation) => (
          <RowDeleteIcon onClick={() => { setSelected(row); setShowDelete(true); }} />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const lat = Number(form.latitude);
  const lng = Number(form.longitude);
  const mapLat = form.latitude.trim() !== "" && Number.isFinite(lat) ? lat : DEFAULT_LAT;
  const mapLng = form.longitude.trim() !== "" && Number.isFinite(lng) ? lng : DEFAULT_LNG;

  return (
    <PageWrapper>
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3 rounded border border-default bg-elevated p-4">
          <GridActions
            onAdd={openCreate}
            onEdit={() => selected && openEdit(selected)}
            onDelete={() => selected && setShowDelete(true)}
            disableEdit={!selected}
            disableDelete={!selected}
          />
          <p className="text-[13px] text-toned">
            Titik kantor & radius yang diizinkan untuk absensi dari aplikasi mobile. Karyawan tanpa lokasi khusus boleh absen di semua lokasi aktif.
          </p>
        </div>
        <div className="mt-4">
          <DataTable
            data={data}
            columns={columns}
            loading={loading}
            selectedId={selected?.ID ?? null}
            onRowClick={setSelected}
            emptyMessage="Belum ada lokasi absensi"
          />
        </div>
      </Card>

      <Modal
        open={showForm}
        onClose={() => !saving && setShowForm(false)}
        title={form.id ? "Ubah Lokasi Absensi" : "Tambah Lokasi Absensi"}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Batal</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Simpan</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Cari alamat / nama tempat (min. 3 karakter)"
                  value={query}
                  leftIcon={Search}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (!searching) handleSearch(); } }}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="h-9" onClick={handleSearch} loading={searching} disabled={query.trim().length < 3}>
                  Cari
                </Button>
                <Button variant="secondary" size="sm" className="h-9" icon={Crosshair} onClick={useMyLocation} loading={locating}>
                  Gunakan lokasi saya
                </Button>
              </div>
            </div>
            {results && results.length > 0 && (
              <ul className="max-h-40 overflow-y-auto rounded border border-default bg-elevated text-[13px] shadow-sm">
                {results.map((r) => (
                  <li key={r.place_id}>
                    <button
                      type="button"
                      onClick={() => pickResult(r)}
                      className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-bg"
                    >
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{r.display_name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showForm && (
              <LocationMapPicker
                latitude={mapLat}
                longitude={mapLng}
                radius={Number(form.radiusMeters) || 0}
                onChange={(la, ln) => setPoint(la, ln)}
                focusToken={focusToken}
              />
            )}
            <p className="text-xs text-muted">
              Klik peta atau geser penanda untuk menentukan titik kantor. Lingkaran menunjukkan radius absensi.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Latitude"
                type="number"
                step="0.0000001"
                value={form.latitude}
                onChange={(e) => setField("latitude", e.target.value)}
                onBlur={() => Number.isFinite(Number(form.latitude)) && setFocusToken((t) => t + 1)}
              />
              <Input
                label="Longitude"
                type="number"
                step="0.0000001"
                value={form.longitude}
                onChange={(e) => setField("longitude", e.target.value)}
                onBlur={() => Number.isFinite(Number(form.longitude)) && setFocusToken((t) => t + 1)}
              />
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <Input label="Nama Lokasi" required value={form.name} maxLength={150} onChange={(e) => setField("name", e.target.value)} />
            <div className="space-y-1.5">
              <label htmlFor="loc-address" className="block text-[13px] font-medium text-gray-700">Alamat</label>
              <textarea
                id="loc-address"
                rows={3}
                maxLength={500}
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                className="w-full rounded border border-default bg-elevated px-3 py-2 text-sm text-highlighted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Input
              label="Radius (meter)"
              type="number"
              min={10}
              max={5000}
              required
              value={form.radiusMeters}
              onChange={(e) => setField("radiusMeters", e.target.value)}
              hint="10 - 5000 m"
            />
            <input
              type="range"
              min={10}
              max={1000}
              step={10}
              value={Math.min(Number(form.radiusMeters) || 10, 1000)}
              onChange={(e) => setField("radiusMeters", e.target.value)}
              className="w-full accent-primary"
              aria-label="Radius"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Jam Masuk" type="time" required value={form.workStart} onChange={(e) => setField("workStart", e.target.value)} />
              <Input label="Jam Pulang" type="time" required value={form.workEnd} onChange={(e) => setField("workEnd", e.target.value)} />
            </div>
            <Input
              label="Toleransi Terlambat (menit)"
              type="number"
              min={0}
              max={240}
              value={form.lateToleranceMinutes}
              onChange={(e) => setField("lateToleranceMinutes", e.target.value)}
              hint="Clock in setelah jam masuk + toleransi dianggap terlambat"
            />
            <label className="flex items-center gap-2 text-sm text-highlighted">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setField("isActive", e.target.checked)}
                className="size-4 accent-primary"
              />
              Aktif
            </label>
            {formError && (
              <div className="rounded border border-danger/30 bg-danger/5 px-3 py-2 text-[13px] text-danger">{formError}</div>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Lokasi Absensi"
        message={`Yakin ingin menghapus lokasi ${selected?.Name ?? ""}? Bila lokasi sudah memiliki riwayat absensi, lokasi hanya akan dinonaktifkan.`}
        confirmText="Hapus"
        variant="danger"
        loading={saving}
      />
    </PageWrapper>
  );
}
