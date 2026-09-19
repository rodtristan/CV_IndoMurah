import { api } from "@/lib/api-client";

const VALIDATION_ERR = /must be|should not exist|should not be empty|invalid|email/i;

/**
 * Create a record whose "Kode" is generated automatically (Ketoko "Auto").
 * The current API still requires the code in the DTO, so it is generated at
 * submit time only: PREFIX + zero-padded (latest ID + 1). Retries with the next
 * number when the code collides (soft-deleted rows keep their unique codes),
 * finally falling back to a timestamp-based code.
 */
export async function createWithAutoCode<T>(
  endpoint: string,
  prefix: string,
  codeKey: "Code" | "code",
  payload: Record<string, unknown>,
): Promise<T | undefined> {
  let seq = 1;
  try {
    const latest = await api.get<{ ID: number }[]>(endpoint, { $select: "ID", $orderBy: { ID: "desc" }, $take: 1 }, { skipCache: true });
    seq = (latest.data?.[0]?.ID ?? 0) + 1;
  } catch { /* fall through with seq = 1 */ }

  let lastErr: unknown;
  for (let i = 0; i < 5; i++) {
    const code = i < 4
      ? `${prefix}${String(seq + i).padStart(4, "0")}`
      : `${prefix}${Date.now().toString(36).toUpperCase()}`;
    try {
      const res = await api.post<T>(endpoint, { ...payload, [codeKey]: code });
      return res.data;
    } catch (e) {
      lastErr = e;
      if (VALIDATION_ERR.test(e instanceof Error ? e.message : String(e))) break;
    }
  }
  throw lastErr;
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
