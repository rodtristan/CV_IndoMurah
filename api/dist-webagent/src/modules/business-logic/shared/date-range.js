"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDateRange = resolveDateRange;
exports.requireIntParam = requireIntParam;
const common_1 = require("@nestjs/common");
function resolveDateRange(startDate, endDate) {
    const now = new Date();
    const parse = (value, name) => {
        const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
        if (Number.isNaN(d.getTime())) {
            throw new common_1.BadRequestException(`${name} tidak valid: ${String(value)}`);
        }
        return d;
    };
    const start = startDate !== undefined && startDate !== null && startDate !== ''
        ? parse(startDate, 'startDate')
        : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    let end;
    if (endDate !== undefined && endDate !== null && endDate !== '') {
        end = parse(endDate, 'endDate');
        if (typeof endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(endDate.trim())) {
            end.setUTCHours(23, 59, 59, 999);
        }
    }
    else {
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }
    if (start.getTime() > end.getTime()) {
        throw new common_1.BadRequestException('startDate tidak boleh setelah endDate');
    }
    return { start, end };
}
function requireIntParam(value, name) {
    const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
    if (!Number.isInteger(n) || n <= 0) {
        throw new common_1.BadRequestException(`Parameter ${name} wajib diisi (angka)`);
    }
    return n;
}
