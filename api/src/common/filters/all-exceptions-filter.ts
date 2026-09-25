// ================================================================
// all-exceptions-filter.ts — Format error global & cegah kebocoran detail internal
// ================================================================
//
// - HttpException (4xx/5xx yang sengaja dilempar) → pesan asli dipertahankan,
//   KECUALI di production bila pesannya jelas berisi detail internal Prisma/stack.
// - Error Prisma yang dikenal → dipetakan ke status yang masuk akal
//   (P2002 → 409 duplikat, P2025 → 404, P2003 → 409 relasi).
// - Error lain (bug, error DB mentah) → 500 dengan pesan generik; detailnya
//   hanya ke log server.
//
// Bentuk body: { success: false, statusCode, message, error? } — kompatibel
// dengan format default NestJS yang dibaca web (field `message`).
// ================================================================

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

const INTERNAL_PATTERNS = [/prisma/i, /Invalid `/, /\n\s*→/, /at .+\.(ts|js):\d+/, /Unique constraint failed/i, /Foreign key constraint/i];

function looksInternal(msg: unknown): boolean {
  const text = Array.isArray(msg) ? msg.join(' ') : String(msg ?? '');
  return INTERNAL_PATTERNS.some((re) => re.test(text));
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');
  private readonly isProd = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse();
    const req = ctx.getRequest();
    const path = String(req?.url ?? '').split('?')[0];

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: unknown = 'Terjadi kesalahan pada server';
    let error: string | undefined = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
        error = undefined;
      } else if (res && typeof res === 'object') {
        const r = res as Record<string, unknown>;
        message = r.message ?? exception.message;
        error = typeof r.error === 'string' ? r.error : undefined;
      }
      if (status >= 500) {
        this.logger.error(`${req?.method} ${path} → ${status}: ${exception.message}`, exception.stack);
        if (this.isProd) message = 'Terjadi kesalahan pada server';
      } else if (this.isProd && looksInternal(message)) {
        this.logger.warn(`${req?.method} ${path} → ${status} (pesan internal disembunyikan): ${String(message)}`);
        message = 'Permintaan tidak dapat diproses. Periksa kembali data yang dikirim.';
      }
    } else {
      const e = exception as { code?: string; message?: string; stack?: string; name?: string } | undefined;
      const code = e?.code;
      if (e?.name?.startsWith('PrismaClient') && code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'Data dengan nilai yang sama sudah ada';
        error = 'Conflict';
      } else if (e?.name?.startsWith('PrismaClient') && code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Data tidak ditemukan';
        error = 'Not Found';
      } else if (e?.name?.startsWith('PrismaClient') && code === 'P2003') {
        status = HttpStatus.CONFLICT;
        message = 'Data masih dipakai / relasi tidak valid';
        error = 'Conflict';
      } else if (e?.name === 'PrismaClientValidationError') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Parameter query/data tidak valid';
        error = 'Bad Request';
      }
      if (status >= 500) {
        this.logger.error(`${req?.method} ${path} → ${status}: ${e?.message ?? String(exception)}`, e?.stack);
        if (!this.isProd && e?.message) message = e.message;
      } else {
        this.logger.warn(`${req?.method} ${path} → ${status}: ${e?.message ?? ''}`);
      }
    }

    const body: Record<string, unknown> = { success: false, statusCode: status, message };
    if (error) body.error = error;

    // Fastify reply (platform-fastify)
    if (typeof reply?.status === 'function' && typeof reply?.send === 'function') {
      reply.status(status).send(body);
    } else if (typeof reply?.code === 'function') {
      reply.code(status).send(body);
    }
  }
}
