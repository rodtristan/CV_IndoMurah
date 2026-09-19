// Ketoko's 8 account groups mapped onto the API's 6 AccountType rows (IDs follow the seed order).
export interface AccountGroup { key: string; label: string; typeCode: string; typeId: number; prefix: string; debitNormal: boolean }

export const ACCOUNT_GROUPS: AccountGroup[] = [
  { key: "AKTIVA", label: "Aktiva", typeCode: "ASSET", typeId: 1, prefix: "1", debitNormal: true },
  { key: "KEWAJIBAN", label: "Kewajiban", typeCode: "LIABILITY", typeId: 2, prefix: "2", debitNormal: false },
  { key: "MODAL", label: "Modal", typeCode: "EQUITY", typeId: 3, prefix: "3", debitNormal: false },
  { key: "PENDAPATAN", label: "Pendapatan", typeCode: "REVENUE", typeId: 4, prefix: "4", debitNormal: false },
  { key: "HPP", label: "HPP", typeCode: "COST", typeId: 6, prefix: "5", debitNormal: true },
  { key: "BIAYA", label: "Biaya", typeCode: "EXPENSE", typeId: 5, prefix: "6", debitNormal: true },
  { key: "PENDAPATAN LAIN", label: "Pendapatan Lain", typeCode: "REVENUE", typeId: 4, prefix: "7", debitNormal: false },
  { key: "BIAYA LAIN", label: "Biaya Lain", typeCode: "EXPENSE", typeId: 5, prefix: "8", debitNormal: true },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export function groupOf(a: any): string {
  const first = String(a.Code ?? "")[0];
  if (first === "7") return "PENDAPATAN LAIN";
  if (first === "8") return "BIAYA LAIN";
  const byType = ACCOUNT_GROUPS.find((g) => g.typeCode === (a.Type?.Code ?? "") && !["PENDAPATAN LAIN", "BIAYA LAIN"].includes(g.key));
  return byType?.key ?? "AKTIVA";
}
