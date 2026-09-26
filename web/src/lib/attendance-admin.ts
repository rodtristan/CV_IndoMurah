// ============================================================
// Absensi mobile — client untuk endpoint HRD /attendance-admin/*
// Endpoint ini mengembalikan JSON mentah (bukan {success,data}),
// dan foto/xlsx adalah biner, jadi dipanggil langsung dengan fetch
// + Bearer token milik api-client.
// ============================================================

import { api, API_BASE_URL } from "@/lib/api-client";


export interface AttendanceLocation {
  ID: number;
  Name: string;
  Address: string | null;
  Latitude: string | number;
  Longitude: string | number;
  RadiusMeters: number;
  WorkStart: string;
  WorkEnd: string;
  LateToleranceMinutes: number;
  IsActive: boolean;
  _count?: { Employees: number };
}

export interface LocationPayload {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  workStart: string;
  workEnd: string;
  lateToleranceMinutes: number;
  isActive?: boolean;
}

export interface AccountPayload {
  username: string;
  password?: string;
  attendanceLocationId?: number | null;
}

export interface AttendanceStatusInfo {
  code: string;
  name: string;
  color: string | null;
}

export interface DailyAttendance {
  id: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInOffline: boolean;
  checkOutOffline: boolean;
  checkInDistance: number | null;
  checkOutDistance: number | null;
  checkInLatitude: number | null;
  checkInLongitude: number | null;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  hasCheckInPhoto: boolean;
  hasCheckOutPhoto: boolean;
  workMinutes: number | null;
  status: AttendanceStatusInfo | null;
  location: string | null;
  source: "MOBILE" | "WEB" | string;
  notes: string | null;
}

export interface DailyItem {
  employee: {
    id: number;
    code: string;
    name: string;
    department: string | null;
    position: string | null;
    username: string | null;
    location: string | null;
  };
  attendance: DailyAttendance | null;
}

export interface DailySummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  offline: number;
  notCheckedOut: number;
}

export interface DailyResponse {
  date: string;
  summary: DailySummary;
  items: DailyItem[];
}

function url(path: string): string {
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = api.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Ambil pesan error dari body `{ message: string | string[] }` milik NestJS. */
async function readError(res: Response): Promise<Error> {
  const body = await res.json().catch(() => null);
  const msg = body?.message;
  if (Array.isArray(msg) && msg.length) return new Error(msg.join("; "));
  if (typeof msg === "string" && msg) return new Error(msg);
  if (res.status === 401) return new Error("Sesi berakhir, silakan login ulang");
  return new Error(`Permintaan gagal (HTTP ${res.status})`);
}

async function requestJson<T>(method: string, path: string, body?: unknown): Promise<T> {
  const hasBody = body !== undefined;
  const res = await fetch(url(path), {
    method,
    headers: authHeaders({ Accept: "application/json", ...(hasBody ? { "Content-Type": "application/json" } : {}) }),
    body: hasBody ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw await readError(res);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

async function requestBlob(path: string): Promise<Response> {
  const res = await fetch(url(path), { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw await readError(res);
  return res;
}

export function errorMessage(e: unknown): string {
  return e instanceof Error && e.message ? e.message : "Terjadi kesalahan";
}

export const attendanceAdmin = {
  listLocations: () => requestJson<AttendanceLocation[]>("GET", "attendance-admin/locations"),
  createLocation: (p: LocationPayload) => requestJson<AttendanceLocation>("POST", "attendance-admin/locations", p),
  updateLocation: (id: number, p: LocationPayload) =>
    requestJson<AttendanceLocation>("PATCH", `attendance-admin/locations/${id}`, p),
  deleteLocation: (id: number) =>
    requestJson<{ deleted: boolean; deactivated?: boolean }>("DELETE", `attendance-admin/locations/${id}`),

  setAccount: (employeeId: number, p: AccountPayload) =>
    requestJson<{ employeeId: number; username: string; hasAccount: boolean }>(
      "PUT",
      `attendance-admin/employees/${employeeId}/account`,
      p
    ),
  removeAccount: (employeeId: number) =>
    requestJson<{ employeeId: number; hasAccount: boolean }>("DELETE", `attendance-admin/employees/${employeeId}/account`),

  daily: (date: string) => requestJson<DailyResponse>("GET", `attendance-admin/daily?date=${encodeURIComponent(date)}`),

  /** Foto selfie sebagai Blob (butuh Bearer, jadi tidak bisa <img src> langsung). */
  photo: async (attendanceId: number, kind: "in" | "out"): Promise<Blob> =>
    (await requestBlob(`attendance-admin/photo/${attendanceId}/${kind}`)).blob(),

  /** Unduh rekap .xlsx; nama file diambil dari Content-Disposition bila terbaca. */
  exportXlsx: async (from: string, to: string): Promise<{ blob: Blob; filename: string }> => {
    const res = await requestBlob(
      `attendance-admin/export?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
    const cd = res.headers.get("Content-Disposition") || "";
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
    const fallback = from === to ? `absensi_${from}.xlsx` : `absensi_${from}_${to}.xlsx`;
    const filename = match ? decodeURIComponent(match[1]) : fallback;
    return { blob: await res.blob(), filename };
  },
};

export function downloadBlob(blob: Blob, filename: string): void {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

// ─── Tanggal (zona kantor: WIB) ─────────────────────────────────

/** Tanggal hari ini di Asia/Jakarta, format YYYY-MM-DD. */
export function todayWib(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000;
}

export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null || minutes < 0) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}j ${m}m` : `${m}m`;
}

export function formatDateLong(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function osmLink(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
}

export function googleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
