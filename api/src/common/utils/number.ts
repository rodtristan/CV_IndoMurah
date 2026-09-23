/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Convert Prisma Decimal or any number-like value to a plain JavaScript number.
 * This utility safely handles Decimal, string, number, null, and undefined.
 */
export function number(value: any): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    return parseFloat(value) || 0;
  }
  // Handle Prisma Decimal (has toNumber method)
  if (typeof value === 'object' && typeof (value as any).toNumber === 'function') {
    return (value as any).toNumber();
  }
  if (typeof value === 'object' && typeof (value as any).toString === 'function') {
    return parseFloat(String(value)) || 0;
  }
  return Number(value) || 0;
}
