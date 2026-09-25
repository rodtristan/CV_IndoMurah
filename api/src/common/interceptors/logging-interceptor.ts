// ================================================================
// logging-interceptor.ts — Pencatat Log Setiap Request HTTP
// ================================================================
//
// Satu baris per request di terminal:
//   [HTTP] POST /api/v1/auth/login 200 (125ms) user=admin
//
// Body RESPONSE tidak pernah di-log (bisa berisi JWT, data pelanggan, dst).
// Body REQUEST disimpan ke tabel `logs` setelah di-redact secara rekursif
// dan case-insensitive (password, token, secret, authorization, pin, ...),
// dan hanya di-print ke terminal saat NODE_ENV=development.
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
import { redactDeep } from '../utils/redact';

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
    // Query string bisa berisi token/kata sandi (mis. ?token=...) — simpan path saja.
    const endpoint: string = String(req.url ?? '/').split('?')[0];
    const ipAddress: string | null = req.ip ?? req.socket?.remoteAddress ?? null;
    const userAgent: string | null = req.headers?.['user-agent'] ?? null;

    const requestBody = this.limitSize(redactDeep(req.body));

    // Info user yang login (diisi oleh Passport setelah JWT divalidasi)
    // Jika endpoint tidak butuh login, user akan bernilai undefined/null
    const user = req.user as { id?: string; username?: string } | undefined;
    const userId: string | null       = user?.id ?? null;
    const userFullName: string | null = user?.username ?? null;

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
          responseData: undefined, // sengaja tidak di-log
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
    const line = `${log.method} ${log.endpoint} ${log.responseStatus} (${log.durationMs}ms)` +
      (log.userFullName ? ` user=${log.userFullName}` : '');
    if (log.responseStatus >= 500) {
      this.logger.error(`${line} — ${log.message}`);
    } else if (log.responseStatus >= 400) {
      this.logger.warn(`${line} — ${log.message}`);
    } else {
      this.logger.log(line);
    }
    // Detail body request (sudah di-redact) hanya di development.
    if (process.env.NODE_ENV === 'development' && log.requestBody && typeof log.requestBody === 'object') {
      this.logger.debug(`body: ${JSON.stringify(log.requestBody).slice(0, 2000)}`);
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
          // RequesterLoginID is Int? in schema but User.id is now a uuid
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

  private extractMessage(responseData: unknown): string | null {
    if (responseData && typeof responseData === 'object') {
      const obj = responseData as Record<string, unknown>;
      if (typeof obj['message'] === 'string') return obj['message'];
    }
    return null;
  }

  /** Batasi ukuran payload yang disimpan ke tabel logs (import CSV bisa ribuan baris). */
  private limitSize(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;
    try {
      const json = JSON.stringify(body);
      if (json.length <= 20000) return body;
      return { truncated: true, size: json.length };
    } catch {
      return { unserializable: true };
    }
  }
}
