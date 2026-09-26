// Minimal "Cetak" for the back-office transaction forms: renders the document into a popup and prints it.

import { formatCurrency } from "@/lib/utils";

export interface PrintDoc {
  title: string;
  code: string;
  date: string;
  partnerLabel: string;
  partner: string;
  warehouse?: string;
  rows: { code: string; name: string; qty: string; unit: string; price: number; disc: number; subtotal: number }[];
  totals: { label: string; value: number }[];
  notes?: string;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

export function printDocument(doc: PrintDoc) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  const rows = doc.rows
    .map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.code)}</td><td>${esc(r.name)}</td><td class="r">${esc(r.qty)}</td><td>${esc(r.unit)}</td><td class="r">${formatCurrency(r.price)}</td><td class="r">${r.disc ? formatCurrency(r.disc) : ""}</td><td class="r">${formatCurrency(r.subtotal)}</td></tr>`)
    .join("");
  const totals = doc.totals.map((t) => `<tr><td>${esc(t.label)}</td><td class="r">${formatCurrency(t.value)}</td></tr>`).join("");
  w.document.write(`<!doctype html><html><head><title>${esc(doc.title)} ${esc(doc.code)}</title><style>
    body{font-family:Arial,sans-serif;font-size:12px;margin:24px;color:#111}
    h1{font-size:18px;margin:0 0 8px} table{border-collapse:collapse;width:100%}
    .meta td{padding:2px 8px 2px 0} .grid th,.grid td{border:1px solid #999;padding:4px 6px} .grid th{background:#eee;text-align:left}
    .r{text-align:right} .tot{width:280px;margin:12px 0 0 auto} .tot td{padding:3px 6px}
  </style></head><body>
    <h1>${esc(doc.title)}</h1>
    <table class="meta"><tr><td>No. Transaksi</td><td>: ${esc(doc.code)}</td><td>${esc(doc.partnerLabel)}</td><td>: ${esc(doc.partner)}</td></tr>
    <tr><td>Tanggal</td><td>: ${esc(doc.date)}</td><td>Gudang</td><td>: ${esc(doc.warehouse ?? "-")}</td></tr></table>
    <br/><table class="grid"><thead><tr><th>No</th><th>Kode</th><th>Nama Item</th><th class="r">Jumlah</th><th>Satuan</th><th class="r">Harga</th><th class="r">Potongan</th><th class="r">Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
    <table class="tot">${totals}</table>
    ${doc.notes ? `<p>Keterangan: ${esc(doc.notes)}</p>` : ""}
    <script>window.onload=function(){window.print()}</script>
  </body></html>`);
  w.document.close();
}

/** Cetak daftar sederhana (judul + tabel) — Data Pengiriman, Status Lunas, dll. */
export function printTable(opts: { title: string; subtitle?: string; columns: string[]; rows: (string | number)[][]; rightCols?: number[]; footer?: string }) {
  const w = window.open("", "_blank", "width=1000,height=700");
  if (!w) return;
  const right = new Set(opts.rightCols ?? []);
  const head = opts.columns.map((c, i) => `<th${right.has(i) ? ' class="r"' : ""}>${esc(c)}</th>`).join("");
  const body = opts.rows.map((r) => `<tr>${r.map((v, i) => `<td${right.has(i) ? ' class="r"' : ""}>${esc(String(v ?? ""))}</td>`).join("")}</tr>`).join("");
  w.document.write(`<!doctype html><html><head><title>${esc(opts.title)}</title><style>
    body{font-family:Arial,sans-serif;font-size:12px;margin:24px;color:#111}
    h1{font-size:18px;margin:0 0 4px} p{margin:0 0 10px;color:#444} table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #999;padding:4px 6px} th{background:#eee;text-align:left} .r{text-align:right}
  </style></head><body>
    <h1>${esc(opts.title)}</h1>${opts.subtitle ? `<p>${esc(opts.subtitle)}</p>` : ""}
    <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
    ${opts.footer ? `<p style="margin-top:10px">${esc(opts.footer)}</p>` : ""}
    <script>window.onload=function(){window.print()}</script>
  </body></html>`);
  w.document.close();
}
