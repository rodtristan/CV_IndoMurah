import { BadRequestException } from '@nestjs/common';

/**
 * Normalises an optional (startDate, endDate) query pair for report/analytics
 * endpoints.
 *
 * - Missing start → first day of the current month (00:00).
 * - Missing end   → end of today (23:59:59.999).
 * - A date-only end value ("2026-09-30") is extended to the end of that day so
 *   records created during the last day are included.
 * - Unparseable values → 400 instead of letting Prisma throw a 500 on
 *   `new Date("Invalid Date")`.
 */
export function resolveDateRange(
  startDate?: string | Date | null,
  endDate?: string | Date | null,
): { start: Date; end: Date } {
  const now = new Date();

  const parse = (value: string | Date, name: string): Date => {
    const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException(`${name} tidak valid: ${String(value)}`);
    }
    return d;
  };

  const start =
    startDate !== undefined && startDate !== null && startDate !== ''
      ? parse(startDate, 'startDate')
      : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  let end: Date;
  if (endDate !== undefined && endDate !== null && endDate !== '') {
    end = parse(endDate, 'endDate');
    if (typeof endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(endDate.trim())) {
      end.setUTCHours(23, 59, 59, 999);
    }
  } else {
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  if (start.getTime() > end.getTime()) {
    throw new BadRequestException('startDate tidak boleh setelah endDate');
  }
  return { start, end };
}

/** Parses a required positive integer id (query/param); 400 when missing/invalid. */
export function requireIntParam(value: unknown, name: string): number {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(n) || n <= 0) {
    throw new BadRequestException(`Parameter ${name} wajib diisi (angka)`);
  }
  return n;
}
