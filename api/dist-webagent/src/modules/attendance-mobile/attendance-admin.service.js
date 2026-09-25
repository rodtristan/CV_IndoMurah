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
exports.AttendanceAdminService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const ExcelJS = __importStar(require("exceljs"));
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const attendance_photo_store_1 = require("./attendance-photo.store");
const attendance_time_1 = require("./attendance-time");
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const n = (v) => (v == null ? null : Number(v));
const hhmm = (d) => (d ? (0, attendance_time_1.officeParts)(d).time : '');
let AttendanceAdminService = class AttendanceAdminService {
    constructor(prisma, photos, redis) {
        this.prisma = prisma;
        this.photos = photos;
        this.redis = redis;
    }
    clearEmployeeCache() {
        return this.redis.invalidatePattern('employee:*');
    }
    checkLocation(d) {
        if (!d.name?.trim())
            throw new common_1.BadRequestException('Nama lokasi wajib diisi');
        if (!(Math.abs(d.latitude) <= 90) || !(Math.abs(d.longitude) <= 180))
            throw new common_1.BadRequestException('Titik lokasi tidak valid');
        if (!(d.radiusMeters >= 10 && d.radiusMeters <= 5000))
            throw new common_1.BadRequestException('Radius harus 10 - 5000 meter');
        if (!HHMM.test(d.workStart) || !HHMM.test(d.workEnd))
            throw new common_1.BadRequestException('Jam kerja harus format HH:mm');
        if (!(d.lateToleranceMinutes >= 0 && d.lateToleranceMinutes <= 240))
            throw new common_1.BadRequestException('Toleransi terlambat 0 - 240 menit');
    }
    locData(d) {
        return {
            Name: d.name.trim(),
            Address: d.address?.trim() || null,
            Latitude: new client_1.Prisma.Decimal(d.latitude.toFixed(7)),
            Longitude: new client_1.Prisma.Decimal(d.longitude.toFixed(7)),
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
    createLocation(d) {
        this.checkLocation(d);
        return this.prisma.attendanceLocation.create({ data: this.locData(d) });
    }
    async updateLocation(id, d) {
        this.checkLocation(d);
        await this.getLocation(id);
        return this.prisma.attendanceLocation.update({ where: { ID: id }, data: this.locData(d) });
    }
    async getLocation(id) {
        const l = await this.prisma.attendanceLocation.findUnique({ where: { ID: id } });
        if (!l)
            throw new common_1.NotFoundException('Lokasi tidak ditemukan');
        return l;
    }
    async deleteLocation(id) {
        await this.getLocation(id);
        const used = await this.prisma.attendance.count({ where: { LocationID: id } });
        if (used) {
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
    async setAccount(employeeId, d) {
        const emp = await this.prisma.employee.findUnique({ where: { ID: employeeId }, omit: { PasswordHash: false } });
        if (!emp)
            throw new common_1.NotFoundException('Karyawan tidak ditemukan');
        const username = d.username?.trim().toLowerCase();
        if (!username || !/^[a-z0-9._-]{3,50}$/.test(username)) {
            throw new common_1.BadRequestException('Username 3-50 karakter: huruf kecil, angka, titik, strip, underscore');
        }
        const taken = await this.prisma.employee.findFirst({ where: { Username: username, NOT: { ID: employeeId } }, select: { ID: true } });
        if (taken)
            throw new common_1.ConflictException('Username sudah dipakai karyawan lain');
        if (!emp.PasswordHash && !d.password)
            throw new common_1.BadRequestException('Password wajib diisi untuk akun baru');
        if (d.password && d.password.length < 6)
            throw new common_1.BadRequestException('Password minimal 6 karakter');
        if (d.attendanceLocationId)
            await this.getLocation(d.attendanceLocationId);
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
    async removeAccount(employeeId) {
        await this.prisma.employee.update({ where: { ID: employeeId }, data: { Username: null, PasswordHash: null } });
        await this.clearEmployeeCache();
        return { employeeId, hasAccount: false };
    }
    range(from, to) {
        const today = (0, attendance_time_1.officeParts)(new Date()).date;
        const f = DATE.test(from ?? '') ? from : today;
        const t = DATE.test(to ?? '') ? to : f;
        if (t < f)
            throw new common_1.BadRequestException('Tanggal sampai harus setelah tanggal dari');
        const days = (Date.parse(t) - Date.parse(f)) / 86400000;
        if (days > 92)
            throw new common_1.BadRequestException('Rentang maksimal 3 bulan');
        return { from: f, to: t };
    }
    rowOf(a) {
        return {
            id: a.ID,
            date: a.Date.toISOString().slice(0, 10),
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
    async daily(date) {
        const { from } = this.range(date, date);
        const [employees, rows] = await Promise.all([
            this.prisma.employee.findMany({
                where: { IsActive: true },
                orderBy: { Name: 'asc' },
                include: { Department: true, Position: true, AttendanceLocation: true },
            }),
            this.prisma.attendance.findMany({ where: { Date: (0, attendance_time_1.attendanceDate)(from) }, include: { Status: true, Location: true } }),
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
    async photo(attendanceId, kind) {
        if (kind !== 'in' && kind !== 'out')
            throw new common_1.BadRequestException('Jenis foto harus in atau out');
        const a = await this.prisma.attendance.findUnique({ where: { ID: attendanceId }, select: { CheckInPhoto: true, CheckOutPhoto: true } });
        const ref = kind === 'in' ? a?.CheckInPhoto : a?.CheckOutPhoto;
        if (!ref)
            throw new common_1.NotFoundException('Foto tidak ditemukan');
        return this.photos.load(ref);
    }
    async exportXlsx(from, to) {
        const r = this.range(from, to);
        const rows = await this.prisma.attendance.findMany({
            where: { Date: { gte: (0, attendance_time_1.attendanceDate)(r.from), lte: (0, attendance_time_1.attendanceDate)(r.to) } },
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
};
exports.AttendanceAdminService = AttendanceAdminService;
exports.AttendanceAdminService = AttendanceAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        attendance_photo_store_1.AttendancePhotoStore,
        redis_service_1.RedisService])
], AttendanceAdminService);
