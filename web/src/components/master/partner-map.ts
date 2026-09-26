import type { PartnerCommon } from "./PartnerFields";
import { emptyPartner } from "./PartnerFields";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/** Baris API (PascalCase) → state form partner. */
export function partnerFromRow(r: Row): PartnerCommon {
  return {
    ...emptyPartner,
    name: s(r.Name), address: s(r.Address), city: s(r.City), province: s(r.Province), country: s(r.Country),
    postalCode: s(r.PostalCode), phone: s(r.Phone), fax: s(r.Fax), contact: s(r.ContactPerson), email: s(r.Email),
    accountNo: s(r.BankAccountNumber), accountName: s(r.BankAccountName), bank: s(r.BankName), npwp: s(r.TaxID), notes: s(r.Notes),
  };
}

/** State form partner → payload API. Field kosong: dilewati saat tambah, null saat edit (untuk mengosongkan). */
export function partnerPayload(f: PartnerCommon, isNew: boolean): Row {
  const v = (x: string) => (x.trim() ? x.trim() : isNew ? undefined : null);
  return {
    Name: f.name.trim(),
    Address: v(f.address), City: v(f.city), Province: v(f.province), Country: v(f.country), PostalCode: v(f.postalCode),
    Phone: v(f.phone), Fax: v(f.fax), ContactPerson: v(f.contact), Email: v(f.email),
    BankAccountNumber: v(f.accountNo), BankAccountName: v(f.accountName), BankName: v(f.bank), TaxID: v(f.npwp), Notes: v(f.notes),
  };
}

export const TAX_MODE_OPTIONS = [
  { value: "DEFAULT", label: "Default" },
  { value: "NON", label: "Non" },
  { value: "INCLUDE", label: "Include" },
  { value: "EXCLUDE", label: "Exclude" },
];

/** "Nilai Pajak diset Dari": Data Item hanya tersedia bila pajak Exclude. */
export const taxSourceOptions = (partnerLabel: string, taxMode: string) => [
  { value: "DEFAULT", label: "Default" },
  { value: "PARTNER", label: partnerLabel },
  ...(taxMode === "EXCLUDE" ? [{ value: "ITEM", label: "Data Item" }] : []),
];
