// ================================================================
// logging-interceptor.ts — Pencatat Log Setiap Request HTTP
// ================================================================
//
// ╔══════════════════════════════════════════════════════════════╗
// ║  APA ITU INTERCEPTOR?                                        ║
// ║  Interceptor adalah "penyadap" yang berjalan sebelum DAN     ║
// ║  sesudah controller dieksekusi.                              ║
// ║                                                              ║
// ║  Alur kerja:                                                 ║
// ║    Request masuk → [Interceptor mulai] → Controller          ║
// ║                                              ↓               ║
// ║    Response keluar ← [Interceptor selesai] ←┘               ║
// ╚══════════════════════════════════════════════════════════════╝
//
// Format log di terminal (output saat ada request ke API):
//
//   [HTTP] Endpoint: POST /api/v1/auth/login  (125ms)
//   {
//     "message": "Login successful",
//     "status": 200,
//     "data": { "token": "eyJ..." },
//     "userId": 1,
//     "userFullName": "John Doe",
//     "logDatetime": "16-03-2026 08:00:00 +00:00"
//   }
//
// Data ini juga disimpan ke database tabel `logs`.
// ================================================================

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { PrismaService } from '../prisma/prisma-service';

// Tipe data untuk satu entri log
interface LogPayload {
  method: string;
  endpoint: string;
  requestBody: unknown;
  responseData: unknown;
  responseStatus: number;
  message: string;
  userId: string | null;
  userFullName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  durationMs: number;
  logDatetime: Date;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const startTime = Date.now();

    const method: string = req.method ?? 'UNKNOWN';
    const endpoint: string = req.url ?? '/';
    const ipAddress: string | null = req.ip ?? req.socket?.remoteAddress ?? null;
    const userAgent: string | null = req.headers?.['user-agent'] ?? null;

    const requestBody = this.redactSensitiveFields(req.body);

    // Info user yang login (diisi oleh Passport setelah JWT divalidasi)
    // Jika endpoint tidak butuh login, user akan bernilai undefined/null
    const user = req.user as { id?: string; email?: string } | undefined;
    const userId: string | null       = user?.id ?? null;
    const userFullName: string | null = user?.email ?? null;

    return next.handle().pipe(
      tap((responseData: unknown) => {
        const durationMs = Date.now() - startTime;
        const response = context.switchToHttp().getResponse();
        const responseStatus = (response.statusCode as number) ?? 200;
        const logDatetime = new Date();

        const message = this.extractMessage(responseData) ?? `${method} ${endpoint}`;

        const logPayload: LogPayload = {
          method,
          endpoint,
          requestBody,
          responseData,
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
      }),

      catchError((err) => {
        const durationMs = Date.now() - startTime;
        const responseStatus = (err.status as number) ?? 500;
        const message = (err.message as string) ?? 'Internal Server Error';
        const logDatetime = new Date();

        const logPayload: LogPayload = {
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

        return throwError(() => err);
      }),
    );
  }

  private printLog(log: LogPayload): void {
    const formattedDatetime = this.formatDatetime(log.logDatetime);
    const headerLine = `Endpoint: ${log.method} ${log.endpoint}  (${log.durationMs}ms)`;

    const body = {
      message: log.message,
      status: log.responseStatus,
      data: log.responseData,
      userId: log.userId,
      userFullName: log.userFullName,
      logDatetime: formattedDatetime,
    };

    if (log.responseStatus >= 500) {
      this.logger.error(headerLine);
      console.error(JSON.stringify(body, null, 2));
    } else if (log.responseStatus >= 400) {
      this.logger.warn(headerLine);
      console.warn(JSON.stringify(body, null, 2));
    } else {
      this.logger.log(headerLine);
      console.log(JSON.stringify(body, null, 2));
    }
  }

  private async saveToDatabase(log: LogPayload): Promise<void> {
    try {
      await this.prisma.log.create({
        data: {
          Method:            log.method,
          Endpoint:          log.endpoint,
          Headers:           {},  // Header sudah di-redact, tidak disimpan
          Payload:           (log.requestBody as object) ?? {},
          ResponseStatus:    log.responseStatus,
          Message:           log.message,
          // requesterLoginId is Int? in schema but User.id is now a uuid
          // string (see auth-service.ts) — nothing sensible to store here.
          RequesterFullName: log.userFullName,
          IpAddress:         log.ipAddress,
          UserAgent:         log.userAgent,
          DurationMs:        log.durationMs,
          LogDatetime:       log.logDatetime,
        },
      });
    } catch {
      this.logger.warn('Gagal menyimpan log ke database');
    }
  }

  private formatDatetime(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const dd = pad(date.getUTCDate());
    const mm = pad(date.getUTCMonth() + 1);
    const yyyy = date.getUTCFullYear();
    const hh = pad(date.getUTCHours());
    const min = pad(date.getUTCMinutes());
    const ss = pad(date.getUTCSeconds());
    return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss} +00:00`;
  }

  private extractMessage(responseData: unknown): string | null {
    if (responseData && typeof responseData === 'object') {
      const obj = responseData as Record<string, unknown>;
      if (typeof obj['message'] === 'string') return obj['message'];
    }
    return null;
  }

  private redactSensitiveFields(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;
    const sensitiveFields = ['password', 'password_confirmation', 'token', 'secret', 'pin'];
    const clone = { ...(body as Record<string, unknown>) };
    for (const field of sensitiveFields) {
      if (clone[field] !== undefined) clone[field] = '[REDACTED]';
    }
    return clone;
  }
}
