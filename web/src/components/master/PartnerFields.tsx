"use client";

import { KField, KInput, KRow, KTextarea } from "@/components/kform";

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

export function PartnerFields<T extends PartnerCommon>({
  value, onChange, nameLabel = "Nama", errors = {}, showNpwp = true, salesLabels = false,
}: {
  value: T; onChange: (patch: Partial<PartnerCommon>) => void; nameLabel?: string;
  errors?: Partial<Record<keyof PartnerCommon, string>>; showNpwp?: boolean; salesLabels?: boolean;
}) {
  const t = (k: keyof PartnerCommon) => ({
    value: value[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ [k]: e.target.value }),
  });
  return (
    <>
      <KInput label={nameLabel} {...t("name")} hint={errText(errors.name)} maxLength={255} />
      <KTextarea label="Alamat" rows={3} {...t("address")} maxLength={500} />
      <KRow>
        <KInput label="Kota" {...t("city")} />
        <KInput label="Provinsi" {...t("province")} />
      </KRow>
      <KRow>
        <KInput label="Negara" {...t("country")} />
        <KInput label="Kode Pos" {...t("postalCode")} />
      </KRow>
      <KRow>
        <KInput label="Telepon" {...t("phone")} />
        <KInput label="Fax" {...t("fax")} />
      </KRow>
      <KRow>
        <KInput label="Kontak" {...t("contact")} />
        <KInput label={salesLabels ? "Email" : "E-mail"} type="email" {...t("email")} hint={errText(errors.email)} />
      </KRow>
      <KRow>
        <div>
          <KInput label={salesLabels ? "No. Rek." : "No Rek."} {...t("accountNo")} />
          <KInput label={salesLabels ? "Rekening A/N" : "Rek. A/N"} {...t("accountName")} />
        </div>
        <KTextarea label="Keterangan" rows={5} {...t("notes")} maxLength={1000} />
      </KRow>
      <KRow>
        <KInput label="Bank" {...t("bank")} />
        {showNpwp ? <KInput label="NPWP" {...t("npwp")} /> : <KField>{null}</KField>}
      </KRow>
    </>
  );
}
