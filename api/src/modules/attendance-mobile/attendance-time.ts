// Semua aturan tanggal/jam absensi memakai zona waktu kantor (WIB).
export const OFFICE_TZ = 'Asia/Jakarta';

const fmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: OFFICE_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Tanggal (YYYY-MM-DD) dan jam (HH:mm) lokal kantor untuk sebuah waktu. */
export function officeParts(d: Date): { date: string; time: string } {
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** Kolom Attendance.Date: tanggal lokal kantor disimpan sebagai 00:00 UTC. */
export function attendanceDate(localDate: string): Date {
  return new Date(`${localDate}T00:00:00.000Z`);
}

export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Jarak dua titik GPS dalam meter (haversine). */
export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
