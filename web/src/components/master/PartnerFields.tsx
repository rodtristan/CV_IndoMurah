"use client";

import type { ReactNode } from "react";
import { KInput, KRow, KTextarea } from "@/components/kform";

/** Address / contact / bank fields shared by Pelanggan, Supplier and Sales forms (Ketoko layout). */
export interface PartnerCommon {
  name: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  phone: string;
  fax: string;
  contact: string;
  email: string;
  accountNo: string;
  accountName: string;
  bank: string;
  npwp: string;
  notes: string;
}

export const emptyPartner: PartnerCommon = {
  name: "", address: "", city: "", province: "", country: "", postalCode: "", phone: "", fax: "",
  contact: "", email: "", accountNo: "", accountName: "", bank: "", npwp: "", notes: "",
};

export const errText = (msg?: string) => (msg ? <span className="text-danger">{msg}</span> : undefined);

/**
 * Only the fields listed in `fields` are rendered — each form passes exactly the fields its
 * API model can store, so nothing typed by the user is silently dropped on save.
 * `name` is always shown.
 */
export function PartnerFields<T extends PartnerCommon>({
  value, onChange, nameLabel = "Nama", errors = {}, salesLabels = false, fields,
}: {
  value: T; onChange: (patch: Partial<PartnerCommon>) => void; nameLabel?: string;
  errors?: Partial<Record<keyof PartnerCommon, string>>; salesLabels?: boolean;
  fields: (keyof PartnerCommon)[];
}) {
  const has = (k: keyof PartnerCommon) => fields.includes(k);
  const t = (k: keyof PartnerCommon) => ({
    value: value[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ [k]: e.target.value }),
  });
  // Lay out the visible fields two per row, in the Ketoko order.
  const pair = (a: ReactNode | null, b: ReactNode | null, key: string) => {
    if (a && b) return <KRow key={key}>{a}{b}</KRow>;
    return a ?? b ?? null;
  };
  const input = (k: keyof PartnerCommon, label: string, extra: Record<string, unknown> = {}) =>
    has(k) ? <KInput key={k} label={label} {...t(k)} {...extra} /> : null;

  return (
    <>
      <KInput label={nameLabel} {...t("name")} hint={errText(errors.name)} maxLength={255} />
      {has("address") && <KTextarea label="Alamat" rows={3} {...t("address")} maxLength={500} />}
      {pair(input("city", "Kota", { maxLength: 100 }), input("province", "Provinsi", { maxLength: 100 }), "cp")}
      {pair(input("country", "Negara"), input("postalCode", "Kode Pos"), "cc")}
      {pair(input("phone", "Telepon", { maxLength: 50 }), input("fax", "Fax"), "pf")}
      {pair(
        input("contact", "Kontak", { maxLength: 255 }),
        input("email", salesLabels ? "Email" : "E-mail", { type: "email", hint: errText(errors.email), maxLength: 255 }),
        "ce",
      )}
      {pair(input("accountNo", salesLabels ? "No. Rek." : "No Rek.", { maxLength: 50 }), input("accountName", salesLabels ? "Rekening A/N" : "Rek. A/N", { maxLength: 150 }), "acc")}
      {pair(input("bank", "Bank", { maxLength: 100 }), input("npwp", "NPWP", { maxLength: 50 }), "bn")}
      {has("notes") && <KTextarea label="Keterangan" rows={4} {...t("notes")} maxLength={1000} />}
    </>
  );
}
