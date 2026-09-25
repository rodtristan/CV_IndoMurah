"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlarmClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileSpreadsheet,
  ImageOff,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  Users,
  WifiOff,
} from "lucide-react";
import { PageWrapper, Card } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { cn } from "@/lib/utils";
import {
  attendanceAdmin,
  daysBetween,
  downloadBlob,
  errorMessage,
  formatDateLong,
  formatDuration,
  googleMapsLink,
  osmLink,
  shiftDate,
  todayWib,
  type AttendanceStatusInfo,
  type DailyItem,
  type DailyResponse,
} from "@/lib/attendance-admin";

type StatusFilter = "all" | "present" | "absent" | "late" | "offline";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "present", label: "Hadir" },
  { value: "absent", label: "Belum Absen" },
  { value: "late", label: "Terlambat" },
  { value: "offline", label: "Offline" },
];

type PhotoKind = "in" | "out";

interface PhotoTarget {
  item: DailyItem;
  kind: PhotoKind;
}

// ─── Cache foto (object URL) — dicabut semua saat halaman di-unmount ──────
type PhotoLoader = (attendanceId: number, kind: PhotoKind) => Promise<string>;

function usePhotoCache(): PhotoLoader {
  const cache = useRef(new Map<string, Promise<string>>());
  useEffect(() => {
    const map = cache.current;
    return () => {
      map.forEach((p) => p.then((u) => URL.revokeObjectURL(u)).catch(() => undefined));
      map.clear();
    };
  }, []);
  return useCallback((attendanceId: number, kind: PhotoKind) => {
    const key = `${attendanceId}-${kind}`;
    let p = cache.current.get(key);
    if (!p) {
      p = attendanceAdmin.photo(attendanceId, kind).then((blob) => URL.createObjectURL(blob));
      p.catch(() => cache.current.delete(key)); // boleh dicoba lagi
      cache.current.set(key, p);
    }
    return p;
  }, []);
}

function usePhotoUrl(load: PhotoLoader, attendanceId: number | null, kind: PhotoKind) {
  const [state, setState] = useState<{ url: string | null; error: string | null; loading: boolean }>({
    url: null,
    error: null,
    loading: attendanceId != null,
  });
  useEffect(() => {
    if (attendanceId == null) return;
    let alive = true;
    setState({ url: null, error: null, loading: true });
    load(attendanceId, kind)
      .then((url) => alive && setState({ url, error: null, loading: false }))
      .catch((e) => alive && setState({ url: null, error: errorMessage(e), loading: false }));
    return () => { alive = false; };
  }, [load, attendanceId, kind]);
  return state;
}

function PhotoThumb({ load, attendanceId, kind, onOpen }: { load: PhotoLoader; attendanceId: number; kind: PhotoKind; onOpen: () => void }) {
  const { url, error, loading } = usePhotoUrl(load, attendanceId, kind);
  return (
    <button
      type="button"
      onClick={onOpen}
      title={error ? error : kind === "in" ? "Lihat foto clock in" : "Lihat foto clock out"}
      className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border border-default bg-bg hover:ring-2 hover:ring-primary/40"
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={`Selfie ${kind}`} className="size-full object-cover" />
      ) : loading ? (
        <span className="size-full animate-pulse bg-default/60" />
      ) : (
        <ImageOff className="size-4 text-muted" />
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: AttendanceStatusInfo | null }) {
  if (!status) return <span className="text-muted">-</span>;
  const color = status.color || "#6b7280";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium text-gray-800"
      style={{ borderColor: color, backgroundColor: `${color}1f` }}
    >
      <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      {status.name}
    </span>
  );
}

function OfflineBadge() {
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700"
      title="Direkam offline, waktu dari perangkat — perlu ditinjau"
    >
      <WifiOff className="size-3" />
      Offline
    </span>
  );
}

function matches(item: DailyItem, q: string, status: StatusFilter): boolean {
  const a = item.attendance;
  if (q) {
    const hay = `${item.employee.code} ${item.employee.name}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  switch (status) {
    case "present": return !!a?.checkIn;
    case "absent": return !a?.checkIn;
    case "late": return a?.status?.code === "LATE";
    case "offline": return !!(a?.checkInOffline || a?.checkOutOffline);
    default: return true;
  }
}

export default function AttendancePage() {
  const [date, setDate] = useState<string>(() => todayWib());
  const [daily, setDaily] = useState<DailyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [photo, setPhoto] = useState<PhotoTarget | null>(null);

  const [exporting, setExporting] = useState(false);
  const [showRange, setShowRange] = useState(false);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);

  const loadPhoto = usePhotoCache();
  const today = todayWib();

  const fetchDaily = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDaily(await attendanceAdmin.daily(date));
    } catch (e) {
      setDaily(null);
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchDaily(); }, [fetchDaily]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (daily?.items ?? []).filter((i) => matches(i, q, statusFilter));
  }, [daily, search, statusFilter]);

  const runExport = async (from: string, to: string): Promise<boolean> => {
    setExporting(true);
    try {
      const { blob, filename } = await attendanceAdmin.exportXlsx(from, to);
      downloadBlob(blob, filename);
      toast.success("File Excel diunduh");
      return true;
    } catch (e) {
      toast.error(errorMessage(e));
      return false;
    } finally {
      setExporting(false);
    }
  };

  const openRange = () => {
    setRangeFrom(`${date.slice(0, 7)}-01`);
    setRangeTo(date);
    setRangeError(null);
    setShowRange(true);
  };

  const submitRange = async () => {
    if (!rangeFrom || !rangeTo) { setRangeError("Tanggal dari dan sampai wajib diisi"); return; }
    const days = daysBetween(rangeFrom, rangeTo);
    if (days < 0) { setRangeError("Tanggal sampai harus setelah tanggal dari"); return; }
    if (days > 92) { setRangeError("Rentang maksimal 3 bulan"); return; }
    setRangeError(null);
    if (await runExport(rangeFrom, rangeTo)) setShowRange(false);
  };

  const summary = daily?.summary;
  const photoAtt = photo?.item.attendance ?? null;

  return (
    <PageWrapper>
      {/* Toolbar tanggal + ekspor */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-2">
            <Button variant="outline" size="icon" onClick={() => setDate((d) => shiftDate(d, -1))} title="Hari sebelumnya" aria-label="Hari sebelumnya">
              <ChevronLeft className="size-4" />
            </Button>
            <div className="w-44">
              <Input
                type="date"
                label="Tanggal"
                value={date}
                max={today}
                onChange={(e) => e.target.value && setDate(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDate((d) => shiftDate(d, 1))}
              disabled={date >= today}
              title="Hari berikutnya"
              aria-label="Hari berikutnya"
            >
              <ChevronRight className="size-4" />
            </Button>
            {date !== today && (
              <Button variant="ghost" size="sm" className="h-9" icon={CalendarDays} onClick={() => setDate(today)}>
                Hari ini
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-9" icon={RefreshCw} onClick={fetchDaily} loading={loading}>
              Muat ulang
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-toned">{formatDateLong(date)}</span>
            <Button variant="success" size="sm" className="h-9" icon={FileSpreadsheet} onClick={() => runExport(date, date)} loading={exporting}>
              Ekspor Excel
            </Button>
            <Button variant="outline" size="sm" className="h-9" icon={Download} onClick={openRange} disabled={exporting}>
              Ekspor Rentang
            </Button>
          </div>
        </div>
      </Card>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Karyawan" value={summary?.total ?? 0} icon={Users} loading={loading && !daily} />
        <StatCard title="Hadir" value={summary?.present ?? 0} icon={UserCheck} iconClassName="bg-success/10 text-success" loading={loading && !daily} />
        <StatCard title="Belum Absen" value={summary?.absent ?? 0} icon={UserX} iconClassName="bg-danger/10 text-danger" loading={loading && !daily} />
        <StatCard title="Terlambat" value={summary?.late ?? 0} icon={AlarmClock} iconClassName="bg-warning/10 text-warning" loading={loading && !daily} />
        <StatCard title="Offline" value={summary?.offline ?? 0} icon={WifiOff} iconClassName="bg-info/10 text-info" loading={loading && !daily} />
        <StatCard title="Belum Clock Out" value={summary?.notCheckedOut ?? 0} icon={LogOut} iconClassName="bg-primary/10 text-primary" loading={loading && !daily} />
      </div>

      <Card className="p-4">
        {/* Filter */}
        <div className="flex flex-col gap-3 rounded border border-default bg-elevated p-4 sm:flex-row sm:items-end">
          <div className="sm:w-72">
            <Input
              label="Cari"
              placeholder="Nama atau kode karyawan"
              leftIcon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              options={STATUS_FILTERS}
            />
          </div>
          <p className="text-[13px] text-toned sm:ml-auto">
            Menampilkan <span className="font-semibold text-highlighted">{rows.length}</span> dari {daily?.items.length ?? 0} karyawan aktif
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded border border-danger/30 bg-danger/5 px-3 py-2 text-[13px] text-danger">{error}</div>
        )}

        {/* Tabel */}
        <div className="mt-4 overflow-x-auto rounded border border-default">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-default bg-[#f5f6f8] text-left text-gray-600">
                <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Kode</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Nama</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Departemen</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Lokasi</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Clock In</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Clock Out</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Durasi</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Status</th>
                <th className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">Jarak (m)</th>
              </tr>
            </thead>
            <tbody>
              {loading && !daily ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-default last:border-b-0">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-3.5 w-full animate-pulse rounded bg-bg" /></td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted">
                    {daily ? "Tidak ada karyawan yang cocok dengan filter" : "Tidak ada data"}
                  </td>
                </tr>
              ) : (
                rows.map((item) => {
                  const a = item.attendance;
                  const absent = !a?.checkIn;
                  return (
                    <tr
                      key={item.employee.id}
                      className={cn(
                        "border-b border-default align-middle last:border-b-0",
                        absent ? "bg-danger/[0.04] text-toned" : "hover:bg-[#f5f6f8]"
                      )}
                    >
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{item.employee.code}</td>
                      <td className="px-3 py-2">
                        <div className={cn("font-medium", absent ? "text-toned" : "text-[#1e293b]")}>{item.employee.name}</div>
                        {item.employee.position && <div className="text-[11px] text-muted">{item.employee.position}</div>}
                        {!item.employee.username && <div className="text-[11px] text-muted">Belum punya akun mobile</div>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">{item.employee.department || "-"}</td>
                      <td className="whitespace-nowrap px-3 py-2">
                        {a?.location || item.employee.location || <span className="text-muted">Semua lokasi</span>}
                      </td>
                      <td className="px-3 py-2">
                        {a?.checkIn ? (
                          <div className="flex items-center gap-2">
                            {a.hasCheckInPhoto && (
                              <PhotoThumb load={loadPhoto} attendanceId={a.id} kind="in" onOpen={() => setPhoto({ item, kind: "in" })} />
                            )}
                            <div className="space-y-0.5">
                              <div className="font-semibold text-[#1e293b]">{a.checkInTime}</div>
                              {a.checkInOffline && <OfflineBadge />}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex rounded bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">Belum absen</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {a?.checkOut ? (
                          <div className="flex items-center gap-2">
                            {a.hasCheckOutPhoto && (
                              <PhotoThumb load={loadPhoto} attendanceId={a.id} kind="out" onOpen={() => setPhoto({ item, kind: "out" })} />
                            )}
                            <div className="space-y-0.5">
                              <div className="font-semibold text-[#1e293b]">{a.checkOutTime}</div>
                              {a.checkOutOffline && <OfflineBadge />}
                            </div>
                          </div>
                        ) : a?.checkIn ? (
                          <span className="text-xs text-warning">Belum clock out</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">{formatDuration(a?.workMinutes)}</td>
                      <td className="whitespace-nowrap px-3 py-2">
                        {a ? <StatusBadge status={a.status} /> : <span className="text-xs text-danger">Belum absen</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                        {a?.checkInDistance != null || a?.checkOutDistance != null ? (
                          <div className="space-y-0.5 text-xs">
                            {a?.checkInDistance != null && <div>In: {Math.round(a.checkInDistance)}</div>}
                            {a?.checkOutDistance != null && <div>Out: {Math.round(a.checkOutDistance)}</div>}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Foto selfie diperbesar */}
      <Modal
        open={!!photo && !!photoAtt}
        onClose={() => setPhoto(null)}
        title={photo ? `Foto ${photo.kind === "in" ? "Clock In" : "Clock Out"} — ${photo.item.employee.name}` : ""}
        size="lg"
      >
        {photo && photoAtt && (
          <PhotoDetail
            load={loadPhoto}
            attendanceId={photoAtt.id}
            kind={photo.kind}
            time={photo.kind === "in" ? photoAtt.checkInTime : photoAtt.checkOutTime}
            date={photoAtt.date}
            lat={photo.kind === "in" ? photoAtt.checkInLatitude : photoAtt.checkOutLatitude}
            lng={photo.kind === "in" ? photoAtt.checkInLongitude : photoAtt.checkOutLongitude}
            distance={photo.kind === "in" ? photoAtt.checkInDistance : photoAtt.checkOutDistance}
            offline={photo.kind === "in" ? photoAtt.checkInOffline : photoAtt.checkOutOffline}
            location={photoAtt.location}
          />
        )}
      </Modal>

      {/* Ekspor rentang */}
      <Modal
        open={showRange}
        onClose={() => !exporting && setShowRange(false)}
        title="Ekspor Excel (Rentang Tanggal)"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRange(false)} disabled={exporting}>Batal</Button>
            <Button variant="success" icon={FileSpreadsheet} onClick={submitRange} loading={exporting}>Ekspor</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input type="date" label="Dari" value={rangeFrom} max={today} onChange={(e) => setRangeFrom(e.target.value)} />
            <Input type="date" label="Sampai" value={rangeTo} max={today} onChange={(e) => setRangeTo(e.target.value)} />
          </div>
          <p className="text-xs text-muted">Rentang maksimal 3 bulan.</p>
          {rangeError && <div className="rounded border border-danger/30 bg-danger/5 px-3 py-2 text-[13px] text-danger">{rangeError}</div>}
        </div>
      </Modal>
    </PageWrapper>
  );
}

function PhotoDetail({
  load,
  attendanceId,
  kind,
  time,
  date,
  lat,
  lng,
  distance,
  offline,
  location,
}: {
  load: PhotoLoader;
  attendanceId: number;
  kind: PhotoKind;
  time: string | null;
  date: string;
  lat: number | null;
  lng: number | null;
  distance: number | null;
  offline: boolean;
  location: string | null;
}) {
  const { url, error, loading } = usePhotoUrl(load, attendanceId, kind);
  const hasPoint = lat != null && lng != null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
      <div className="flex min-h-64 items-center justify-center overflow-hidden rounded border border-default bg-bg sm:col-span-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Foto selfie absensi" className="max-h-[60vh] w-full object-contain" />
        ) : loading ? (
          <span className="text-sm text-muted">Memuat foto...</span>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted">
            <ImageOff className="size-8" />
            {error || "Foto tidak tersedia"}
          </div>
        )}
      </div>
      <div className="space-y-3 text-[13px] sm:col-span-2">
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 size-4 text-muted" />
          <div>
            <div className="text-xs text-muted">Waktu {kind === "in" ? "clock in" : "clock out"}</div>
            <div className="font-semibold text-highlighted">{time || "-"} WIB</div>
            <div className="text-xs text-toned">{formatDateLong(date)}</div>
            {offline && <div className="mt-1"><OfflineBadge /></div>}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 text-muted" />
          <div className="min-w-0">
            <div className="text-xs text-muted">Koordinat</div>
            {hasPoint ? (
              <div className="font-mono text-xs text-highlighted">{lat!.toFixed(6)}, {lng!.toFixed(6)}</div>
            ) : (
              <div className="text-muted">-</div>
            )}
            {distance != null && (
              <div className="text-xs text-toned">
                {Math.round(distance)} m dari {location || "kantor"}
              </div>
            )}
          </div>
        </div>
        {hasPoint && (
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={osmLink(lat!, lng!)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded border border-default px-2.5 py-1.5 text-xs text-highlighted hover:border-primary hover:text-primary"
            >
              <ExternalLink className="size-3.5" /> OpenStreetMap
            </a>
            <a
              href={googleMapsLink(lat!, lng!)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded border border-default px-2.5 py-1.5 text-xs text-highlighted hover:border-primary hover:text-primary"
            >
              <ExternalLink className="size-3.5" /> Google Maps
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
