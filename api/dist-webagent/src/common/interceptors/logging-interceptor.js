"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const prisma_service_1 = require("../prisma/prisma-service");
const redact_1 = require("../utils/redact");
let LoggingInterceptor = class LoggingInterceptor {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger('HTTP');
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const startTime = Date.now();
        const method = req.method ?? 'UNKNOWN';
        const endpoint = String(req.url ?? '/').split('?')[0];
        const ipAddress = req.ip ?? req.socket?.remoteAddress ?? null;
        const userAgent = req.headers?.['user-agent'] ?? null;
        const requestBody = this.limitSize((0, redact_1.redactDeep)(req.body));
        const user = req.user;
        const userId = user?.id ?? null;
        const userFullName = user?.username ?? null;
        return next.handle().pipe((0, operators_1.tap)((responseData) => {
            const durationMs = Date.now() - startTime;
            const response = context.switchToHttp().getResponse();
            const responseStatus = response.statusCode ?? 200;
            const logDatetime = new Date();
            const message = this.extractMessage(responseData) ?? `${method} ${endpoint}`;
            const logPayload = {
                method,
                endpoint,
                requestBody,
                responseData: undefined,
                responseStatus,
                message,
                userId,
                userFullName,
                ipAddress,
                userAgent,
                durationMs,
                logDatetime,
            };
            this.printLog(logPayload);
            void this.saveToDatabase(logPayload);
        }), (0, operators_1.catchError)((err) => {
            const durationMs = Date.now() - startTime;
            const responseStatus = err.status ?? 500;
            const message = err.message ?? 'Internal Server Error';
            const logDatetime = new Date();
            const logPayload = {
                method,
                endpoint,
                requestBody,
                responseData: { error: message },
                responseStatus,
                message,
                userId,
                userFullName,
                ipAddress,
                userAgent,
                durationMs,
                logDatetime,
            };
            this.printLog(logPayload);
            void this.saveToDatabase(logPayload);
            return (0, rxjs_1.throwError)(() => err);
        }));
    }
    printLog(log) {
        const line = `${log.method} ${log.endpoint} ${log.responseStatus} (${log.durationMs}ms)` +
            (log.userFullName ? ` user=${log.userFullName}` : '');
        if (log.responseStatus >= 500) {
            this.logger.error(`${line} — ${log.message}`);
        }
        else if (log.responseStatus >= 400) {
            this.logger.warn(`${line} — ${log.message}`);
        }
        else {
            this.logger.log(line);
        }
        if (process.env.NODE_ENV === 'development' && log.requestBody && typeof log.requestBody === 'object') {
            this.logger.debug(`body: ${JSON.stringify(log.requestBody).slice(0, 2000)}`);
        }
    }
    async saveToDatabase(log) {
        try {
            await this.prisma.log.create({
                data: {
                    Method: log.method,
                    Endpoint: log.endpoint,
                    Headers: {},
                    Payload: log.requestBody ?? {},
                    ResponseStatus: log.responseStatus,
                    Message: log.message,
                    RequesterFullName: log.userFullName,
                    IpAddress: log.ipAddress,
                    UserAgent: log.userAgent,
                    DurationMs: log.durationMs,
                    LogDatetime: log.logDatetime,
                },
            });
        }
        catch {
            this.logger.warn('Gagal menyimpan log ke database');
        }
    }
    extractMessage(responseData) {
        if (responseData && typeof responseData === 'object') {
            const obj = responseData;
            if (typeof obj['message'] === 'string')
                return obj['message'];
        }
        return null;
    }
    limitSize(body) {
        if (!body || typeof body !== 'object')
            return body;
        try {
            const json = JSON.stringify(body);
            if (json.length <= 20000)
                return body;
            return { truncated: true, size: json.length };
        }
        catch {
            return { unserializable: true };
        }
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoggingInterceptor);
