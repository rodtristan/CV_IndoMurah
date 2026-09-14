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
  // [HTTP] Endpoint: POST /api/v1/auth/login  (125ms)
  // {
  //   "message": "Login successful",
  //   "status": 200,
  //   "data": { "token": "eyJ..." },
  //   "user_id": 1,
  //   "user_full_name": "John Doe",
  //   "log_datetime": "16-03-2026 08:00:00 +00:00"
  // }
//
// Data ini JUGA disimpan ke database tabel `logs`.
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
  // Logger dari NestJS — menampilkan prefix "[HTTP]" di terminal
  private readonly logger = new Logger('HTTP');

  // PrismaService disuntikkan lewat constructor (Dependency Injection)
  constructor(private readonly prisma: PrismaService) {}

  // intercept() dipanggil untuk SETIAP request yang masuk ke aplikasi
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req       = context.switchToHttp().getRequest();
    const startTime = Date.now(); // Catat waktu mulai

    // ── Info dari HTTP request ──────────────────────────────────────────
    const method: string          = req.method ?? 'UNKNOWN';
    const endpoint: string        = req.url ?? '/';
    const ipAddress: string | null = req.ip ?? req.socket?.remoteAddress ?? null;
    const userAgent: string | null = req.headers?.['user-agent'] ?? null;

    // Body request dibersihkan dulu dari data sensitif
    const requestBody = this.redactSensitiveFields(req.body);

    // Info user yang login (diisi oleh Passport setelah JWT divalidasi)
    // Jika endpoint tidak butuh login, user akan bernilai undefined/null
    const user = req.user as { id?: string; email?: string } | undefined;
    const userId: string | null       = user?.id ?? null;
    const userFullName: string | null = user?.email ?? null;

    // Teruskan request ke controller, lalu tangkap hasilnya dengan .pipe()
    return next.handle().pipe(

      // ── Setelah controller berhasil mengembalikan data ──────────────
      // `responseData` adalah nilai yang di-return oleh method controller
      tap((responseData: unknown) => {
        const durationMs     = Date.now() - startTime;
        const response       = context.switchToHttp().getResponse();
        const responseStatus = (response.statusCode as number) ?? 200;
        const logDatetime    = new Date();

        // Ambil pesan dari response body (field "message")
        const message = this.extractMessage(responseData) ?? `${method} ${endpoint}`;

        // Buat satu objek log yang berisi semua info
        const logPayload: LogPayload = {
          method, endpoint, requestBody, responseData,
          responseStatus, message, userId, userFullName,
          ipAddress, userAgent, durationMs, logDatetime,
        };

        // Tampilkan di terminal + simpan ke database secara paralel
        this.printLog(logPayload);
        void this.saveToDatabase(logPayload);
      }),

      // ── Jika controller melempar Error ─────────────────────────────
      catchError((err) => {
        const durationMs     = Date.now() - startTime;
        const responseStatus = (err.status as number) ?? 500;
        const message        = (err.message as string) ?? 'Internal Server Error';
        const logDatetime    = new Date();

        const logPayload: LogPayload = {
          method, endpoint, requestBody,
          responseData: { error: message },
          responseStatus, message, userId, userFullName,
          ipAddress, userAgent, durationMs, logDatetime,
        };

        this.printLog(logPayload);
        void this.saveToDatabase(logPayload);

        // WAJIB lempar ulang error agar NestJS kirim response error ke client
        return throwError(() => err);
      }),
    );
  }

  // ────────────────────────────────────────────────────────────────────
  // Tampilkan log terformat di terminal
  // ────────────────────────────────────────────────────────────────────
  private printLog(log: LogPayload): void {
    const formattedDatetime = this.formatDatetime(log.logDatetime);

    // Header baris pertama: method + endpoint + durasi
    const headerLine = `Endpoint: ${log.method} ${log.endpoint}  (${log.durationMs}ms)`;

    // Isi log
    const body = {
      message:        log.message,
      status:         log.responseStatus,
      data:           log.responseData,
      user_id:        log.userId,
      user_full_name: log.userFullName,
      log_datetime:   formattedDatetime,
    };

    // Warna berbeda berdasarkan HTTP status code:
    // 5xx → error (merah), 4xx → warn (kuning), 2xx/3xx → log (hijau)
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

  // ────────────────────────────────────────────────────────────────────
  // Simpan log ke tabel `logs` di database
  // Dibungkus try-catch agar kegagalan logging tidak crash server
  // ────────────────────────────────────────────────────────────────────
  private async saveToDatabase(log: LogPayload): Promise<void> {
    try {
      await this.prisma.log.create({
        data: {
          method:            log.method,
          endpoint:          log.endpoint,
          headers:           {},  // Header sudah di-redact, tidak disimpan
          payload:           (log.requestBody as object) ?? {},
          responseStatus:    log.responseStatus,
          message:           log.message,
          // requesterLoginId is Int? in schema but User.id is now a uuid
          // string (see auth-service.ts) — nothing sensible to store here.
          requesterFullName: log.userFullName,
          ipAddress:         log.ipAddress,
          userAgent:         log.userAgent,
          durationMs:        log.durationMs,
          logDatetime:       log.logDatetime,
        },
      });
    } catch {
      // Cukup warn — jangan crash server karena kegagalan logging
      this.logger.warn('⚠️  Gagal menyimpan log ke database');
    }
  }

  // ────────────────────────────────────────────────────────────────────
  // Format tanggal: Date → "DD-MM-YYYY HH:mm:ss +00:00"
  // ────────────────────────────────────────────────────────────────────
  private formatDatetime(date: Date): string {
    const pad  = (n: number) => String(n).padStart(2, '0');
    const dd   = pad(date.getUTCDate());
    const mm   = pad(date.getUTCMonth() + 1); // Bulan dimulai dari 0 di JS!
    const yyyy = date.getUTCFullYear();
    const hh   = pad(date.getUTCHours());
    const min  = pad(date.getUTCMinutes());
    const ss   = pad(date.getUTCSeconds());
    return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss} +00:00`;
  }

  // ────────────────────────────────────────────────────────────────────
  // Ambil field "message" dari response controller
  // Response standar: { success: true, message: "...", data: {...} }
  // ────────────────────────────────────────────────────────────────────
  private extractMessage(responseData: unknown): string | null {
    if (responseData && typeof responseData === 'object') {
      const obj = responseData as Record<string, unknown>;
      if (typeof obj['message'] === 'string') return obj['message'];
    }
    return null;
  }

  // ────────────────────────────────────────────────────────────────────
  // Sembunyikan field sensitif dari body request
  // { "password": "123456" } → { "password": "[REDACTED]" }
  // ────────────────────────────────────────────────────────────────────
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
