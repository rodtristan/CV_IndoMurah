import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { AttendancePhotoStore } from './attendance-photo.store';
import { attendanceDate, officeParts } from './attendance-time';

export interface LocationInput {
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

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const n = (v: Prisma.Decimal | null | undefined) => (v == null ? null : Number(v));
const hhmm = (d: Date | null) => (d ? officeParts(d).time : '');

@Injectable()
export class AttendanceAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly photos: AttendancePhotoStore,
    private readonly redis: RedisService,
  ) {}

  /** Endpoint generik /employees di-cache Redis (BaseService); bersihkan setelah perubahan langsung. */
  private clearEmployeeCache() {
    return this.redis.invalidatePattern('employee:*');
  }

  // ── Lokasi kantor ─────────────────────────────────────────────────
  private checkLocation(d: LocationInput) {
    if (!d.name?.trim()) throw new BadRequestException('Nama lokasi wajib diisi');
    if (!(Math.abs(d.latitude) <= 90) || !(Math.abs(d.longitude) <= 180)) throw new BadRequestException('Titik lokasi tidak valid');
    if (!(d.radiusMeters >= 10 && d.radiusMeters <= 5000)) throw new BadRequestException('Radius harus 10 - 5000 meter');
    if (!HHMM.test(d.workStart) || !HHMM.test(d.workEnd)) throw new BadRequestException('Jam kerja harus format HH:mm');
    if (!(d.lateToleranceMinutes >= 0 && d.lateToleranceMinutes <= 240)) throw new BadRequestException('Toleransi terlambat 0 - 240 menit');
  }

  private locData(d: LocationInput) {
    return {
      Name: d.name.trim(),
      Address: d.address?.trim() || null,
      Latitude: new Prisma.Decimal(d.latitude.toFixed(7)),
      Longitude: new Prisma.Decimal(d.longitude.toFixed(7)),
      RadiusMeters: Math.round(d.radiusMeters),
      WorkStart: d.workStart,
      WorkEnd: d.workEnd,
      LateToleranceMinutes: Math.round(d.lateToleranceMinutes),
      IsActive: d.isActive ?? true,
    };
  }

  listLocations() {
    return this.prisma.attendanceLocation.findMany({
      orderBy: { ID: 'asc' },
      include: { _count: { select: { Employees: true } } },
    });
  }

  createLocation(d: LocationInput) {
    this.checkLocation(d);
    return this.prisma.attendanceLocation.create({ data: this.locData(d) });
  }

  async updateLocation(id: number, d: LocationInput) {
    this.checkLocation(d);
    await this.getLocation(id);
    return this.prisma.attendanceLocation.update({ where: { ID: id }, data: this.locData(d) });
  }

  private async getLocation(id: number) {
    const l = await this.prisma.attendanceLocation.findUnique({ where: { ID: id } });
    if (!l) throw new NotFoundException('Lokasi tidak ditemukan');
    return l;
  }

  async deleteLocation(id: number) {
    await this.getLocation(id);
    const used = await this.prisma.attendance.count({ where: { LocationID: id } });
    if (used) {
      // Riwayat absensi tetap merujuk lokasi ini, jadi hanya dinonaktifkan.
      await this.prisma.attendanceLocation.update({ where: { ID: id }, data: { IsActive: false } });
      await this.prisma.employee.updateMany({ where: { AttendanceLocationID: id }, data: { AttendanceLocationID: null } });
      await this.clearEmployeeCache();
      return { deleted: false, deactivated: true };
    }
    await this.prisma.employee.updateMany({ where: { AttendanceLocationID: id }, data: { AttendanceLocationID: null } });
    await this.prisma.attendanceLocation.delete({ where: { ID: id } });
    await this.clearEmployeeCache();
    return { deleted: true };
  }

  // ── Akun mobile karyawan ─────────────────────────────────────────
  async setAccount(employeeId: number, d: { username?: string; password?: string; attendanceLocationId?: number | null }) {
    const emp = await this.prisma.employee.findUnique({ where: { ID: employeeId }, omit: { PasswordHash: false } });
    if (!emp) throw new NotFoundException('Karyawan tidak ditemukan');
    const username = d.username?.trim().toLowerCase();
    if (!username || !/^[a-z0-9._-]{3,50}$/.test(username)) {
      throw new BadRequestException('Username 3-50 karakter: huruf kecil, angka, titik, strip, underscore');
    }
    const taken = await this.prisma.employee.findFirst({ where: { Username: username, NOT: { ID: employeeId } }, select: { ID: true } });
    if (taken) throw new ConflictException('Username sudah dipakai karyawan lain');
    if (!emp.PasswordHash && !d.password) throw new BadRequestException('Password wajib diisi untuk akun baru');
    if (d.password && d.password.length < 6) throw new BadRequestException('Password minimal 6 karakter');
    if (d.attendanceLocationId) await this.getLocation(d.attendanceLocationId);

    await this.prisma.employee.update({
      where: { ID: employeeId },
      data: {
        Username: username,
        ...(d.password ? { PasswordHash: await argon2.hash(d.password, { type: argon2.argon2id }) } : {}),
        ...(d.attendanceLocationId !== undefined ? { AttendanceLocationID: d.attendanceLocationId || null } : {}),
      },
    });
    await this.clearEmployeeCache();
    return { employeeId, username, hasAccount: true };
  }

  async removeAccount(employeeId: number) {
    await this.prisma.employee.update({ where: { ID: employeeId }, data: { Username: null, PasswordHash: null } });
    await this.clearEmployeeCache();
    return { employeeId, hasAccount: false };
  }

  // ── Rekap ────────────────────────────────────────────────────────
  private range(from?: string, to?: string) {
    const today = officeParts(new Date()).date;
    const f = DATE.test(from ?? '') ? from! : today;
    const t = DATE.test(to ?? '') ? to! : f;
    if (t < f) throw new BadRequestException('Tanggal sampai harus setelah tanggal dari');
    const days = (Date.parse(t) - Date.parse(f)) / 86400000;
    if (days > 92) throw new BadRequestException('Rentang maksimal 3 bulan');
    return { from: f, to: t };
  }

  private rowOf(a: any) {
    return {
      id: a.ID,
      date: (a.Date as Date).toISOString().slice(0, 10),
      checkIn: a.CheckIn,
      checkOut: a.CheckOut,
      checkInTime: hhmm(a.CheckIn),
      checkOutTime: hhmm(a.CheckOut),
      checkInOffline: a.CheckInOffline,
      checkOutOffline: a.CheckOutOffline,
      checkInDistance: n(a.CheckInDistance),
      checkOutDistance: n(a.CheckOutDistance),
      checkInLatitude: n(a.CheckInLatitude),
      checkInLongitude: n(a.CheckInLongitude),
      checkOutLatitude: n(a.CheckOutLatitude),
      checkOutLongitude: n(a.CheckOutLongitude),
      hasCheckInPhoto: !!a.CheckInPhoto,
      hasCheckOutPhoto: !!a.CheckOutPhoto,
      workMinutes: a.CheckIn && a.CheckOut ? Math.round((a.CheckOut.getTime() - a.CheckIn.getTime()) / 60000) : null,
      status: a.Status ? { code: a.Status.Code, name: a.Status.Name, color: a.Status.Color } : null,
      location: a.Location?.Name ?? null,
      source: a.Source,
      notes: a.Notes,
    };
  }

  /** Semua karyawan aktif untuk satu tanggal, termasuk yang belum absen. */
  async daily(date?: string) {
    const { from } = this.range(date, date);
    const [employees, rows] = await Promise.all([
      this.prisma.employee.findMany({
        where: { IsActive: true },
        orderBy: { Name: 'asc' },
        include: { Department: true, Position: true, AttendanceLocation: true },
      }),
      this.prisma.attendance.findMany({ where: { Date: attendanceDate(from) }, include: { Status: true, Location: true } }),
    ]);
    const byEmp = new Map(rows.map((r) => [r.EmployeeID, r]));
    const items = employees.map((e) => {
      const a = byEmp.get(e.ID);
      return {
        employee: {
          id: e.ID, code: e.Code, name: e.Name, department: e.Department?.Name ?? null, position: e.Position?.Name ?? null,
          username: e.Username, location: e.AttendanceLocation?.Name ?? null,
        },
        attendance: a ? this.rowOf(a) : null,
      };
    });
    const present = items.filter((i) => i.attendance?.checkIn).length;
    const summary = {
      total: items.length,
      present,
      absent: items.length - present,
      late: items.filter((i) => i.attendance?.status?.code === 'LATE').length,
      offline: items.filter((i) => i.attendance?.checkInOffline || i.attendance?.checkOutOffline).length,
      notCheckedOut: items.filter((i) => i.attendance?.checkIn && !i.attendance?.checkOut).length,
    };
    return { date: from, summary, items };
  }

  async photo(attendanceId: number, kind: string) {
    if (kind !== 'in' && kind !== 'out') throw new BadRequestException('Jenis foto harus in atau out');
    const a = await this.prisma.attendance.findUnique({ where: { ID: attendanceId }, select: { CheckInPhoto: true, CheckOutPhoto: true } });
    const ref = kind === 'in' ? a?.CheckInPhoto : a?.CheckOutPhoto;
    if (!ref) throw new NotFoundException('Foto tidak ditemukan');
    return this.photos.load(ref);
  }

  async exportXlsx(from?: string, to?: string): Promise<{ filename: string; data: Buffer }> {
    const r = this.range(from, to);
    const rows = await this.prisma.attendance.findMany({
      where: { Date: { gte: attendanceDate(r.from), lte: attendanceDate(r.to) } },
      include: { Status: true, Location: true, Employee: { include: { Department: true, Position: true } } },
      orderBy: [{ Date: 'asc' }, { Employee: { Name: 'asc' } }],
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Toko CV IndoMurah';
    const ws = wb.addWorksheet('Absensi');
    ws.columns = [
      { header: 'Tanggal', key: 'date', width: 12 },
      { header: 'Kode', key: 'code', width: 12 },
      { header: 'Nama Karyawan', key: 'name', width: 26 },
      { header: 'Departemen', key: 'dept', width: 16 },
      { header: 'Jabatan', key: 'pos', width: 16 },
      { header: 'Lokasi', key: 'loc', width: 18 },
      { header: 'Clock In', key: 'in', width: 10 },
      { header: 'Clock Out', key: 'out', width: 10 },
      { header: 'Durasi Kerja', key: 'dur', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Jarak In (m)', key: 'din', width: 12 },
      { header: 'Jarak Out (m)', key: 'dout', width: 12 },
      { header: 'Offline', key: 'off', width: 10 },
      { header: 'Koordinat In', key: 'gin', width: 24 },
      { header: 'Koordinat Out', key: 'gout', width: 24 },
      { header: 'Catatan', key: 'notes', width: 24 },
    ];
    for (const a of rows) {
      const x = this.rowOf(a);
      const off = [x.checkInOffline && 'In', x.checkOutOffline && 'Out'].filter(Boolean).join(', ');
      ws.addRow({
        date: x.date, code: a.Employee.Code, name: a.Employee.Name, dept: a.Employee.Department?.Name ?? '',
        pos: a.Employee.Position?.Name ?? '', loc: x.location ?? '', in: x.checkInTime, out: x.checkOutTime,
        dur: x.workMinutes != null ? `${Math.floor(x.workMinutes / 60)}j ${x.workMinutes % 60}m` : '',
        status: x.status?.name ?? '', din: x.checkInDistance ?? '', dout: x.checkOutDistance ?? '', off,
        gin: x.checkInLatitude != null ? `${x.checkInLatitude}, ${x.checkInLongitude}` : '',
        gout: x.checkOutLatitude != null ? `${x.checkOutLatitude}, ${x.checkOutLongitude}` : '',
        notes: x.notes ?? '',
      });
    }
    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    ws.autoFilter = { from: 'A1', to: 'P1' };
    const data = Buffer.from(await wb.xlsx.writeBuffer());
    const name = r.from === r.to ? r.from : `${r.from}_sd_${r.to}`;
    return { filename: `absensi_${name}.xlsx`, data };
  }
}
