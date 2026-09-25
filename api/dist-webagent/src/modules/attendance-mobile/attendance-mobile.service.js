"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceMobileService = exports.MAX_OFFLINE_AGE_H = exports.MAX_GPS_ACCURACY_M = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const attendance_photo_store_1 = require("./attendance-photo.store");
const attendance_time_1 = require("./attendance-time");
exports.MAX_GPS_ACCURACY_M = 100;
exports.MAX_OFFLINE_AGE_H = 72;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const n = (v) => (v == null ? null : Number(v));
let AttendanceMobileService = class AttendanceMobileService {
    constructor(prisma, jwt, photos, redis) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.photos = photos;
        this.redis = redis;
    }
    async login(username, password) {
        const emp = await this.prisma.employee.findUnique({
            where: { Username: username?.trim() ?? '' },
            omit: { PasswordHash: false },
        });
        const ok = !!emp?.PasswordHash && (await argon2.verify(emp.PasswordHash, password ?? '').catch(() => false));
        if (!emp || !ok)
            throw new common_1.UnauthorizedException('Username atau password salah');
        if (!emp.IsActive)
            throw new common_1.UnauthorizedException('Akun karyawan tidak aktif');
        const token = await this.jwt.signAsync({ typ: 'employee', employeeId: emp.ID });
        return { token, ...(await this.profile(emp)) };
    }
    async locationsFor(emp) {
        return this.prisma.attendanceLocation.findMany({
            where: emp.AttendanceLocationID ? { ID: emp.AttendanceLocationID, IsActive: true } : { IsActive: true },
            orderBy: { ID: 'asc' },
        });
    }
    mapLocation(l) {
        return {
            id: l.ID, name: l.Name, address: l.Address, latitude: n(l.Latitude), longitude: n(l.Longitude),
            radiusMeters: l.RadiusMeters, workStart: l.WorkStart, workEnd: l.WorkEnd, lateToleranceMinutes: l.LateToleranceMinutes,
        };
    }
    mapAttendance(a) {
        if (!a)
            return null;
        return {
            id: a.ID,
            date: a.Date.toISOString().slice(0, 10),
            checkIn: a.CheckIn, checkOut: a.CheckOut,
            checkInOffline: a.CheckInOffline, checkOutOffline: a.CheckOutOffline,
            checkInDistance: n(a.CheckInDistance), checkOutDistance: n(a.CheckOutDistance),
            status: a.Status ? { code: a.Status.Code, name: a.Status.Name, color: a.Status.Color } : null,
            location: a.Location ? a.Location.Name : null,
        };
    }
    async profile(emp) {
        const today = (0, attendance_time_1.officeParts)(new Date()).date;
        const [locations, att] = await Promise.all([
            this.locationsFor(emp),
            this.prisma.attendance.findUnique({
                where: { EmployeeID_Date: { EmployeeID: emp.ID, Date: (0, attendance_time_1.attendanceDate)(today) } },
                include: { Status: true, Location: true },
            }),
        ]);
        return {
            employee: { id: emp.ID, code: emp.Code, name: emp.Name },
            locations: locations.map((l) => this.mapLocation(l)),
            today: this.mapAttendance(att),
            serverTime: new Date().toISOString(),
            rules: { maxGpsAccuracyMeters: exports.MAX_GPS_ACCURACY_M, maxOfflineAgeHours: exports.MAX_OFFLINE_AGE_H },
        };
    }
    async history(emp, month) {
        const m = /^\d{4}-\d{2}$/.test(month ?? '') ? month : (0, attendance_time_1.officeParts)(new Date()).date.slice(0, 7);
        const from = (0, attendance_time_1.attendanceDate)(`${m}-01`);
        const to = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1));
        const rows = await this.prisma.attendance.findMany({
            where: { EmployeeID: emp.ID, Date: { gte: from, lt: to } },
            include: { Status: true, Location: true },
            orderBy: { Date: 'desc' },
        });
        return { month: m, items: rows.map((r) => this.mapAttendance(r)) };
    }
    async validate(emp, input) {
        const now = new Date();
        let at = now;
        if (input.offline) {
            const t = input.capturedAt ? new Date(input.capturedAt) : null;
            if (!t || isNaN(t.getTime()))
                throw new common_1.BadRequestException('Absensi offline wajib menyertakan waktu foto (capturedAt)');
            if (t.getTime() > now.getTime() + MAX_CLOCK_SKEW_MS)
                throw new common_1.BadRequestException('Waktu foto berada di masa depan. Periksa jam perangkat');
            if (now.getTime() - t.getTime() > exports.MAX_OFFLINE_AGE_H * 3600 * 1000) {
                throw new common_1.BadRequestException(`Absensi offline lebih dari ${exports.MAX_OFFLINE_AGE_H} jam tidak dapat dikirim. Hubungi HRD`);
            }
            at = t;
        }
        const { latitude: lat, longitude: lng, accuracy } = input;
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
            throw new common_1.BadRequestException('Koordinat lokasi tidak valid');
        }
        if (input.isMocked)
            throw new common_1.BadRequestException('Lokasi palsu (fake GPS) terdeteksi. Matikan aplikasi pemalsu lokasi');
        if (!Number.isFinite(accuracy) || accuracy > exports.MAX_GPS_ACCURACY_M) {
            throw new common_1.BadRequestException(`Sinyal GPS kurang akurat (±${Math.round(accuracy || 0)} m). Coba di area terbuka lalu ulangi`);
        }
        const locations = await this.locationsFor(emp);
        if (!locations.length)
            throw new common_1.BadRequestException('Lokasi kantor belum diatur. Hubungi HRD');
        const ranked = locations
            .map((l) => ({ l, d: (0, attendance_time_1.distanceMeters)(lat, lng, Number(l.Latitude), Number(l.Longitude)) }))
            .sort((a, b) => a.d - b.d);
        const inside = ranked.find((x) => x.d <= x.l.RadiusMeters);
        if (!inside) {
            const near = ranked[0];
            throw new common_1.BadRequestException(`Anda berada ${Math.round(near.d)} m dari ${near.l.Name}. Absensi hanya bisa dalam radius ${near.l.RadiusMeters} m`);
        }
        return { at, location: inside.l, distance: inside.d };
    }
    photoName(emp, kind, at, mime) {
        const ext = mime === 'image/png' ? 'png' : 'jpg';
        return `absensi-${emp.Code}-${(0, attendance_time_1.officeParts)(at).date}-${kind}-${at.getTime()}.${ext}`;
    }
    async statusId(code) {
        const s = await this.prisma.attendanceStatus.findUnique({ where: { Code: code } });
        if (!s)
            throw new common_1.BadRequestException(`Status absensi ${code} belum ada (jalankan seeder)`);
        return s.ID;
    }
    async clockIn(emp, input) {
        const { at, location, distance } = await this.validate(emp, input);
        const local = (0, attendance_time_1.officeParts)(at);
        const key = { EmployeeID_Date: { EmployeeID: emp.ID, Date: (0, attendance_time_1.attendanceDate)(local.date) } };
        const existing = await this.prisma.attendance.findUnique({ where: key });
        if (existing?.CheckIn)
            throw new common_1.ConflictException('Anda sudah clock in hari ini');
        const late = (0, attendance_time_1.minutesOf)(local.time) > (0, attendance_time_1.minutesOf)(location.WorkStart) + location.LateToleranceMinutes;
        const photo = await this.photos.save(this.photoName(emp, 'in', at, input.photo.mimeType), input.photo.mimeType, input.photo.data);
        const data = {
            CheckIn: at,
            CheckInLatitude: new client_1.Prisma.Decimal(input.latitude),
            CheckInLongitude: new client_1.Prisma.Decimal(input.longitude),
            CheckInPhoto: photo,
            CheckInDistance: new client_1.Prisma.Decimal(distance.toFixed(2)),
            CheckInAccuracy: new client_1.Prisma.Decimal(input.accuracy.toFixed(2)),
            CheckInOffline: input.offline,
            CheckInSyncedAt: input.offline ? new Date() : null,
            LocationID: location.ID,
            StatusID: await this.statusId(late ? 'LATE' : 'PRESENT'),
            Source: 'MOBILE',
        };
        const row = await this.prisma.attendance.upsert({
            where: key,
            create: { EmployeeID: emp.ID, Date: (0, attendance_time_1.attendanceDate)(local.date), ...data },
            update: data,
            include: { Status: true, Location: true },
        });
        await this.redis.invalidatePattern('attendance:*');
        return this.mapAttendance(row);
    }
    async clockOut(emp, input) {
        const { at, location, distance } = await this.validate(emp, input);
        const local = (0, attendance_time_1.officeParts)(at);
        const key = { EmployeeID_Date: { EmployeeID: emp.ID, Date: (0, attendance_time_1.attendanceDate)(local.date) } };
        const existing = await this.prisma.attendance.findUnique({ where: key });
        if (!existing?.CheckIn)
            throw new common_1.BadRequestException('Anda belum clock in pada tanggal tersebut');
        if (existing.CheckOut)
            throw new common_1.ConflictException('Anda sudah clock out hari ini');
        if (at.getTime() <= existing.CheckIn.getTime())
            throw new common_1.BadRequestException('Waktu clock out harus setelah clock in');
        const photo = await this.photos.save(this.photoName(emp, 'out', at, input.photo.mimeType), input.photo.mimeType, input.photo.data);
        const row = await this.prisma.attendance.update({
            where: key,
            data: {
                CheckOut: at,
                CheckOutLatitude: new client_1.Prisma.Decimal(input.latitude),
                CheckOutLongitude: new client_1.Prisma.Decimal(input.longitude),
                CheckOutPhoto: photo,
                CheckOutDistance: new client_1.Prisma.Decimal(distance.toFixed(2)),
                CheckOutAccuracy: new client_1.Prisma.Decimal(input.accuracy.toFixed(2)),
                CheckOutOffline: input.offline,
                CheckOutSyncedAt: input.offline ? new Date() : null,
                LocationID: existing.LocationID ?? location.ID,
            },
            include: { Status: true, Location: true },
        });
        await this.redis.invalidatePattern('attendance:*');
        return this.mapAttendance(row);
    }
};
exports.AttendanceMobileService = AttendanceMobileService;
exports.AttendanceMobileService = AttendanceMobileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        attendance_photo_store_1.AttendancePhotoStore,
        redis_service_1.RedisService])
], AttendanceMobileService);
