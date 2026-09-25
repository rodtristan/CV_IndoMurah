"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const INTERNAL_PATTERNS = [/prisma/i, /Invalid `/, /\n\s*→/, /at .+\.(ts|js):\d+/, /Unique constraint failed/i, /Foreign key constraint/i];
function looksInternal(msg) {
    const text = Array.isArray(msg) ? msg.join(' ') : String(msg ?? '');
    return INTERNAL_PATTERNS.some((re) => re.test(text));
}
let AllExceptionsFilter = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger('Exception');
        this.isProd = process.env.NODE_ENV === 'production';
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const reply = ctx.getResponse();
        const req = ctx.getRequest();
        const path = String(req?.url ?? '').split('?')[0];
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Terjadi kesalahan pada server';
        let error = 'Internal Server Error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
                error = undefined;
            }
            else if (res && typeof res === 'object') {
                const r = res;
                message = r.message ?? exception.message;
                error = typeof r.error === 'string' ? r.error : undefined;
            }
            if (status >= 500) {
                this.logger.error(`${req?.method} ${path} → ${status}: ${exception.message}`, exception.stack);
                if (this.isProd)
                    message = 'Terjadi kesalahan pada server';
            }
            else if (this.isProd && looksInternal(message)) {
                this.logger.warn(`${req?.method} ${path} → ${status} (pesan internal disembunyikan): ${String(message)}`);
                message = 'Permintaan tidak dapat diproses. Periksa kembali data yang dikirim.';
            }
        }
        else {
            const e = exception;
            const code = e?.code;
            if (e?.name?.startsWith('PrismaClient') && code === 'P2002') {
                status = common_1.HttpStatus.CONFLICT;
                message = 'Data dengan nilai yang sama sudah ada';
                error = 'Conflict';
            }
            else if (e?.name?.startsWith('PrismaClient') && code === 'P2025') {
                status = common_1.HttpStatus.NOT_FOUND;
                message = 'Data tidak ditemukan';
                error = 'Not Found';
            }
            else if (e?.name?.startsWith('PrismaClient') && code === 'P2003') {
                status = common_1.HttpStatus.CONFLICT;
                message = 'Data masih dipakai / relasi tidak valid';
                error = 'Conflict';
            }
            else if (e?.name === 'PrismaClientValidationError') {
                status = common_1.HttpStatus.BAD_REQUEST;
                message = 'Parameter query/data tidak valid';
                error = 'Bad Request';
            }
            if (status >= 500) {
                this.logger.error(`${req?.method} ${path} → ${status}: ${e?.message ?? String(exception)}`, e?.stack);
                if (!this.isProd && e?.message)
                    message = e.message;
            }
            else {
                this.logger.warn(`${req?.method} ${path} → ${status}: ${e?.message ?? ''}`);
            }
        }
        const body = { success: false, statusCode: status, message };
        if (error)
            body.error = error;
        if (typeof reply?.status === 'function' && typeof reply?.send === 'function') {
            reply.status(status).send(body);
        }
        else if (typeof reply?.code === 'function') {
            reply.code(status).send(body);
        }
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
