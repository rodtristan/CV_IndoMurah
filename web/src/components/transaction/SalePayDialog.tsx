"use client";

// Dialog "Pembayaran" penjualan Ketoko: DP SO/Pesanan, Bayar Tunai, Bayar Deposit, Bayar Kredit,
// Bayar Debit, Kartu Kredit, E-Money → Total & Kembali. Sisa yang tidak dibayar = Bayar Kredit (piutang).

import { Printer, Save, Undo2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { cn, formatCurrency } from "@/lib/utils";
import { num, round2 } from "./calc";

export interface SalePayState {
  cash: string;
  deposit: string;
  debit: string;
  card: string;
  emoney: string;
}

export const EMPTY_PAY: SalePayState = { cash: "", deposit: "", debit: "", card: "", emoney: "" };

/** Ringkasan pembayaran: dibayar (tanpa kredit), kredit (piutang) dan kembali. */
export function summarizePay(total: number, dpSo: number, p: SalePayState) {
  const nonCash = dpSo + num(p.deposit) + num(p.debit) + num(p.card) + num(p.emoney);
  const entered = nonCash + num(p.cash);
  const change = Math.max(0, round2(entered - total));
  const paid = round2(Math.min(entered, total));
  return { nonCash: round2(nonCash), entered: round2(entered), paid, credit: round2(Math.max(0, total - entered)), change };
}

export function SalePayDialog({
  open, onClose, total, dpSo, depositBalance, value, onChange, onSave, saving,
}: {
  open: boolean;
  onClose: () => void;
  total: number;
  /** DP Pesanan yang dipakai (dibayar dari deposit pelanggan) */
  dpSo: number;
  depositBalance: number;
  value: SalePayState;
  onChange: (v: SalePayState) => void;
  onSave: (print: boolean) => void;
  saving?: boolean;
}) {
  const s = summarizePay(total, dpSo, value);
  const set = (k: keyof SalePayState, v: string) => onChange({ ...value, [k]: v });
  const fill = (k: keyof SalePayState) => {
    const others = s.entered - num(value[k]);
    set(k, String(round2(Math.max(0, total - others))));
  };
  const depositLeft = Math.max(0, depositBalance - dpSo);
  const overNonCash = s.nonCash > total + 0.005;
  const overDeposit = num(value.deposit) > depositLeft + 0.005;

  const row = (label: string, k: keyof SalePayState | null, readValue?: number, hint?: string) => (
    <div className="flex items-center gap-2">
      <label className="w-40 shrink-0 text-right text-[15px] text-[#2b3540]">{label} :</label>
      <input
        type="number" min={0} step="any" readOnly={!k}
        value={k ? value[k] : String(readValue ?? 0)}
        onFocus={(e) => e.target.select()}
        onChange={(e) => k && set(k, e.target.value)}
        className={cn(
          "h-11 flex-1 rounded border px-3 text-right text-[17px] outline-none focus:border-primary",
          k ? "border-[#cfd4da] bg-white" : "border-dashed border-[#cfd4da] bg-[#f7f8fa]",
        )}
      />
      <button
        type="button" title={k ? "Isi sisa tagihan" : undefined} disabled={!k} onClick={() => k && fill(k)}
        className="h-11 w-10 rounded border border-[#f3b6b6] bg-[#fde0e0] text-xs text-[#8a3b3b] disabled:opacity-40"
      >
        ▭
      </button>
      {hint && <span className="hidden w-28 text-xs text-muted sm:block">{hint}</span>}
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Pembayaran" size="lg">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="w-40 shrink-0 text-right text-3xl text-[#2b3540]">Total :</label>
          <div className="flex h-16 flex-1 items-center justify-end rounded border border-dashed border-[#cfd4da] bg-[#e9afe6] px-4 text-4xl font-bold">
            {formatCurrency(total).replace("Rp", "").trim()}
          </div>
          <span className="w-10" />
        </div>
        {row("DP SO/Pesanan", null, dpSo)}
        {row("Bayar Tunai", "cash")}
        {row("Bayar Deposit", "deposit", undefined, `Saldo ${formatCurrency(depositLeft)}`)}
        {row("Bayar Kredit", null, s.credit)}
        {row("Bayar Debit", "debit")}
        {row("Kartu Kredit", "card")}
        {row("E-Money", "emoney")}
        <div className="flex items-center gap-2">
          <label className="w-40 shrink-0 text-right text-[15px]">Total :</label>
          <div className="flex h-11 flex-1 items-center justify-end rounded bg-[#33d11e] px-3 text-[17px] font-bold">
            {formatCurrency(s.entered + s.credit - s.change).replace("Rp", "").trim()}
          </div>
          <span className="w-10" />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-40 shrink-0 text-right text-[15px]">Kembali :</label>
          <div className="flex h-11 flex-1 items-center justify-end rounded bg-[#ffa500] px-3 text-[17px] font-bold">
            {formatCurrency(s.change).replace("Rp", "").trim()}
          </div>
          <span className="w-10" />
        </div>
        {(overNonCash || overDeposit) && (
          <p className="rounded bg-danger/10 px-3 py-2 text-sm text-danger">
            {overDeposit ? "Bayar Deposit melebihi saldo deposit pelanggan." : "Pembayaran non-tunai tidak boleh melebihi total; kelebihan hanya dari uang tunai (kembali)."}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2 pt-3">
          <button type="button" disabled={saving || overNonCash || overDeposit} onClick={() => onSave(false)} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6] disabled:opacity-50">
            <Save className="size-4 text-[#2b7fd4]" /> {saving ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" disabled={saving || overNonCash || overDeposit} onClick={() => onSave(true)} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6] disabled:opacity-50">
            <Printer className="size-4" /> Simpan + Cetak
          </button>
          <button type="button" onClick={onClose} className="inline-flex h-10 items-center gap-2 rounded border border-[#cfd4da] bg-white px-4 text-sm hover:bg-[#f3f4f6]">
            <Undo2 className="size-4 text-[#e0a100]" /> Kembali
          </button>
        </div>
      </div>
    </Modal>
  );
}
