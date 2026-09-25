import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma/prisma-service';
import { AttendancePhotoStore } from './attendance-photo.store';
import { attendanceDate, distanceMeters, minutesOf, officeParts } from './attendance-time';

export const MAX_GPS_ACCURACY_M = 100;
export const MAX_OFFLINE_AGE_H = 72;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

export interface ClockInput {
  latitude: number;
  longitude: number;
  accuracy: number;
  isMocked: boolean;
  offline: boolean;
  capturedAt?: string;
  photo: { data: Buffer; mimeType: string };
}

type Emp = { ID: number; Code: string; Name: string; AttendanceLocationID: number | null };

const n = (v: Prisma.Decimal | number | null | undefined) => (v == null ? null : Number(v));

@Injectable()
export class AttendanceMobileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly photos: AttendancePhotoStore,
  ) {}

  async login(username: string, password: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { Username: username?.trim() ?? '' },
      omit: { PasswordHash: false },
    });
    const ok = !!emp?.PasswordHash && (await argon2.verify(emp.PasswordHash, password ?? '').catch(() => false));
    if (!emp || !ok) throw new UnauthorizedException('Username atau password salah');
    if (!emp.IsActive) throw new UnauthorizedException('Akun karyawan tidak aktif');
    const token = await this.jwt.signAsync({ typ: 'employee', employeeId: emp.ID });
    return { token, ...(await this.profile(emp)) };
  }

  private async locationsFor(emp: Pick<Emp, 'AttendanceLocationID'>) {
    return this.prisma.attendanceLocation.findMany({
      where: emp.AttendanceLocationID ? { ID: emp.AttendanceLocationID, IsActive: true } : { IsActive: true },
      orderBy: { ID: 'asc' },
    });
  }

  private mapLocation(l: any) {
    return {
      id: l.ID, name: l.Name, address: l.Address, latitude: n(l.Latitude), longitude: n(l.Longitude),
      radiusMeters: l.RadiusMeters, workStart: l.WorkStart, workEnd: l.WorkEnd, lateToleranceMinutes: l.LateToleranceMinutes,
    };
  }

  mapAttendance(a: any) {
    if (!a) return null;
    return {
      id: a.ID,
      date: (a.Date as Date).toISOString().slice(0, 10),
      checkIn: a.CheckIn, checkOut: a.CheckOut,
      checkInOffline: a.CheckInOffline, checkOutOffline: a.CheckOutOffline,
      checkInDistance: n(a.CheckInDistance), checkOutDistance: n(a.CheckOutDistance),
      status: a.Status ? { code: a.Status.Code, name: a.Status.Name, color: a.Status.Color } : null,
      location: a.Location ? a.Location.Name : null,
    };
  }

  async profile(emp: Emp) {
    const today = officeParts(new Date()).date;
    const [locations, att] = await Promise.all([
      this.locationsFor(emp),
      this.prisma.attendance.findUnique({
        where: { EmployeeID_Date: { EmployeeID: emp.ID, Date: attendanceDate(today) } },
        include: { Status: true, Location: true },
      }),
    ]);
    return {
      employee: { id: emp.ID, code: emp.Code, name: emp.Name },
      locations: locations.map((l) => this.mapLocation(l)),
      today: this.mapAttendance(att),
      serverTime: new Date().toISOString(),
      rules: { maxGpsAccuracyMeters: MAX_GPS_ACCURACY_M, maxOfflineAgeHours: MAX_OFFLINE_AGE_H },
    };
  }

  async history(emp: Emp, month?: string) {
    const m = /^\d{4}-\d{2}$/.test(month ?? '') ? month! : officeParts(new Date()).date.slice(0, 7);
    const from = attendanceDate(`${m}-01`);
    const to = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1));
    const rows = await this.prisma.attendance.findMany({
      where: { EmployeeID: emp.ID, Date: { gte: from, lt: to } },
      include: { Status: true, Location: true },
      orderBy: { Date: 'desc' },
    });
    return { month: m, items: rows.map((r) => this.mapAttendance(r)) };
  }

  /** Validasi waktu, GPS, dan geofence. Mengembalikan kantor terdekat yang valid. */
  private async validate(emp: Emp, input: ClockInput) {
    const now = new Date();
    let at = now;
    if (input.offline) {
      const t = input.capturedAt ? new Date(input.capturedAt) : null;
      if (!t || isNaN(t.getTime())) throw new BadRequestException('Absensi offline wajib menyertakan waktu foto (capturedAt)');
      if (t.getTime() > now.getTime() + MAX_CLOCK_SKEW_MS) throw new BadRequestException('Waktu foto berada di masa depan. Periksa jam perangkat');
      if (now.getTime() - t.getTime() > MAX_OFFLINE_AGE_H * 3600 * 1000) {
        throw new BadRequestException(`Absensi offline lebih dari ${MAX_OFFLINE_AGE_H} jam tidak dapat dikirim. Hubungi HRD`);
      }
      at = t;
    }

    const { latitude: lat, longitude: lng, accuracy } = input;
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      throw new BadRequestException('Koordinat lokasi tidak valid');
    }
    if (input.isMocked) throw new BadRequestException('Lokasi palsu (fake GPS) terdeteksi. Matikan aplikasi pemalsu lokasi');
    if (!Number.isFinite(accuracy) || accuracy > MAX_GPS_ACCURACY_M) {
      throw new BadRequestException(`Sinyal GPS kurang akurat (±${Math.round(accuracy || 0)} m). Coba di area terbuka lalu ulangi`);
    }

    const locations = await this.locationsFor(emp);
    if (!locations.length) throw new BadRequestException('Lokasi kantor belum diatur. Hubungi HRD');
    const ranked = locations
      .map((l) => ({ l, d: distanceMeters(lat, lng, Number(l.Latitude), Number(l.Longitude)) }))
      .sort((a, b) => a.d - b.d);
    const inside = ranked.find((x) => x.d <= x.l.RadiusMeters);
    if (!inside) {
      const near = ranked[0];
      throw new BadRequestException(
        `Anda berada ${Math.round(near.d)} m dari ${near.l.Name}. Absensi hanya bisa dalam radius ${near.l.RadiusMeters} m`,
      );
    }
    return { at, location: inside.l, distance: inside.d };
  }

  private photoName(emp: Emp, kind: 'in' | 'out', at: Date, mime: string) {
    const ext = mime === 'image/png' ? 'png' : 'jpg';
    return `absensi-${emp.Code}-${officeParts(at).date}-${kind}-${at.getTime()}.${ext}`;
  }

  private async statusId(code: string) {
    const s = await this.prisma.attendanceStatus.findUnique({ where: { Code: code } });
    if (!s) throw new BadRequestException(`Status absensi ${code} belum ada (jalankan seeder)`);
    return s.ID;
  }

  async clockIn(emp: Emp, input: ClockInput) {
    const { at, location, distance } = await this.validate(emp, input);
    const local = officeParts(at);
    const key = { EmployeeID_Date: { EmployeeID: emp.ID, Date: attendanceDate(local.date) } };
    const existing = await this.prisma.attendance.findUnique({ where: key });
    if (existing?.CheckIn) throw new ConflictException('Anda sudah clock in hari ini');

    const late = minutesOf(local.time) > minutesOf(location.WorkStart) + location.LateToleranceMinutes;
    const photo = await this.photos.save(this.photoName(emp, 'in', at, input.photo.mimeType), input.photo.mimeType, input.photo.data);
    const data = {
      CheckIn: at,
      CheckInLatitude: new Prisma.Decimal(input.latitude),
      CheckInLongitude: new Prisma.Decimal(input.longitude),
      CheckInPhoto: photo,
      CheckInDistance: new Prisma.Decimal(distance.toFixed(2)),
      CheckInAccuracy: new Prisma.Decimal(input.accuracy.toFixed(2)),
      CheckInOffline: input.offline,
      CheckInSyncedAt: input.offline ? new Date() : null,
      LocationID: location.ID,
      StatusID: await this.statusId(late ? 'LATE' : 'PRESENT'),
      Source: 'MOBILE',
    };
    const row = await this.prisma.attendance.upsert({
      where: key,
      create: { EmployeeID: emp.ID, Date: attendanceDate(local.date), ...data },
      update: data,
      include: { Status: true, Location: true },
    });
    return this.mapAttendance(row);
  }

  async clockOut(emp: Emp, input: ClockInput) {
    const { at, location, distance } = await this.validate(emp, input);
    const local = officeParts(at);
    const key = { EmployeeID_Date: { EmployeeID: emp.ID, Date: attendanceDate(local.date) } };
    const existing = await this.prisma.attendance.findUnique({ where: key });
    if (!existing?.CheckIn) throw new BadRequestException('Anda belum clock in pada tanggal tersebut');
    if (existing.CheckOut) throw new ConflictException('Anda sudah clock out hari ini');
    if (at.getTime() <= existing.CheckIn.getTime()) throw new BadRequestException('Waktu clock out harus setelah clock in');

    const photo = await this.photos.save(this.photoName(emp, 'out', at, input.photo.mimeType), input.photo.mimeType, input.photo.data);
    const row = await this.prisma.attendance.update({
      where: key,
      data: {
        CheckOut: at,
        CheckOutLatitude: new Prisma.Decimal(input.latitude),
        CheckOutLongitude: new Prisma.Decimal(input.longitude),
        CheckOutPhoto: photo,
        CheckOutDistance: new Prisma.Decimal(distance.toFixed(2)),
        CheckOutAccuracy: new Prisma.Decimal(input.accuracy.toFixed(2)),
        CheckOutOffline: input.offline,
        CheckOutSyncedAt: input.offline ? new Date() : null,
        LocationID: existing.LocationID ?? location.ID,
      },
      include: { Status: true, Location: true },
    });
    return this.mapAttendance(row);
  }
}
