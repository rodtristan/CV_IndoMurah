"use client";

import { useState } from "react";
import { CalendarClock, Columns, Hash, Image as ImageIcon, Minus, RectangleHorizontal, Sigma, SquareDashedBottom, Type } from "lucide-react";
import type { ReportElement, ReportFieldDef } from "@/lib/report/types";
import { findElement, type BandKey, type DesignerApi } from "../useDesignerState";
import { inputCls } from "../ui";
import { ImageUpload } from "../ImageUpload";
import { BigBtn, Group, Menu, MenuItem, MenuLabel, RBtn } from "./parts";

const sm = { size: 16 } as const;
const lg = { size: 24 } as const;

const ALL_SIDES = { top: true, right: true, bottom: true, left: true };
export const SYMBOLS = ["©", "®", "™", "°", "±", "×", "÷", "•", "→", "✓"];
export const PAGE_NUMBER_PRESETS = [
  { label: "Halaman X", text: "Halaman {PageNumber}" },
  { label: "Halaman X dari Y", text: "Halaman {PageNumber} dari {TotalPages}" },
  { label: "X / Y", text: "{PageNumber} / {TotalPages}" },
  { label: "Halaman X / Y", text: "Halaman {PageNumber} / {TotalPages}" },
];
export const DATE_PRESETS = [
  { label: "Tanggal & jam cetak", text: "{Tanggal}" },
  { label: "Tanggal cetak", text: "{TanggalCetak}" },
  { label: "Jam cetak", text: "{JamCetak}" },
  { label: "Dicetak oleh user", text: "Dicetak oleh {UserLogin}, {Tanggal}" },
];

function activeBand(d: DesignerApi): BandKey {
  return d.band === "footer" || d.band === "pageHeader" ? d.band : "title";
}

/** Word "Page Number" quick-insert: goes to the active header/footer band, footer by default. */
export function PageNumberMenu({ d, big }: { d: DesignerApi; big?: boolean }) {
  const insert = (text: string, align: "left" | "center" | "right") => {
    const target: BandKey = d.band === "pageHeader" ? "pageHeader" : "footer";
    d.addElement("text", { text, x: 0, y: 1, w: 60, h: 5, style: { fontFamily: "Arial", fontSize: 8, align, color: "#000000" } }, target);
  };
  return (
    <Menu icon={<Hash {...(big ? lg : sm)} />} label="No. Halaman" title="Sisipkan nomor halaman (ke Footer, atau Header halaman jika band itu aktif)" big={big} width={230}>
      {(close) => (
        <div>
          <MenuLabel>Sisipkan</MenuLabel>
          {PAGE_NUMBER_PRESETS.map((p) => (
            <MenuItem key={p.text} label={p.label} hint={p.text.replace("{PageNumber}", "1").replace("{TotalPages}", "5")} onClick={() => { insert(p.text, "right"); close(); }} />
          ))}
        </div>
      )}
    </Menu>
  );
}

export function DateMenu({ d, big }: { d: DesignerApi; big?: boolean }) {
  return (
    <Menu icon={<CalendarClock {...(big ? lg : sm)} />} label="Tanggal & Jam" title="Sisipkan tanggal / jam cetak ke band aktif" big={big} width={230}>
      {(close) => (
        <div>
          <MenuLabel>Sisipkan ke band aktif</MenuLabel>
          {DATE_PRESETS.map((p) => (
            <MenuItem key={p.text} label={p.label} onClick={() => { d.addElement("text", { text: p.text, w: 60 }, activeBand(d)); close(); }} />
          ))}
        </div>
      )}
    </Menu>
  );
}

export function InsertTab({ d, fields }: { d: DesignerApi; fields: ReportFieldDef[] }) {
  const [fieldKey, setFieldKey] = useState("");
  const band = activeBand(d);
  const bandLabel = band === "footer" ? "Footer" : band === "pageHeader" ? "Header Halaman" : "Title";

  const insertSymbol = (sym: string) => {
    const def = d.def;
    if (def && d.sel.type === "el") {
      const id = d.sel.ids[0];
      const f = findElement(def, id);
      if (f && f.el.type === "text" && !f.el.locked) {
        d.editSelected((e: ReportElement) => { if (e.id === id) e.text = `${e.text ?? ""}${sym}`; });
        return;
      }
    }
    d.addElement("text", { text: sym, w: 12, h: 6 });
  };

  return (
    <>
      <Group title={`Komponen (band ${bandLabel})`}>
        <BigBtn icon={<Type {...lg} />} label="Teks" onClick={() => d.addElement("text")} title="Sisipkan kotak teks" />
        <BigBtn
          icon={<SquareDashedBottom {...lg} />}
          label="Text Box"
          onClick={() => d.addElement("text", { text: "Teks", w: 50, h: 12, border: { width: 0.3, color: "#000000", style: "solid", sides: { ...ALL_SIDES } }, padding: 1, style: { fontFamily: "Arial", fontSize: 9, align: "left", color: "#000000", valign: "middle" } })}
          title="Sisipkan text box berborder"
        />
        <BigBtn icon={<ImageIcon {...lg} />} label="Logo" onClick={() => d.addElement("image")} title="Sisipkan gambar logo perusahaan ({InfoReport.LogoUrl})" />
        <Menu icon={<ImageIcon {...lg} />} label="Unggah Gambar" title="Sisipkan gambar dari file" big width={240}>
          {(close) => (
            <div className="p-1">
              <div className="mb-1 text-[11px] text-gray-500">PNG, JPG, GIF, atau WEBP (maks 2 MB)</div>
              <ImageUpload onUploaded={(url) => { d.addElement("image", { text: url }); close(); }} />
            </div>
          )}
        </Menu>
      </Group>
      <Group title="Bentuk">
        <BigBtn
          icon={<RectangleHorizontal {...lg} />}
          label="Persegi"
          onClick={() => d.addElement("text", { text: "", w: 40, h: 20, border: { width: 0.3, color: "#000000", style: "solid", sides: { ...ALL_SIDES } } })}
          title="Sisipkan persegi (elemen teks kosong berborder)"
        />
        <BigBtn icon={<Minus {...lg} />} label="Garis Horizontal" onClick={() => d.addElement("line")} title="Sisipkan garis horizontal" />
        <BigBtn
          icon={<Minus {...lg} style={{ transform: "rotate(90deg)" }} />}
          label="Garis Vertikal"
          onClick={() => d.addElement("line", { vertical: true, x: 10, y: 0, w: 0, h: 15 })}
          title="Sisipkan garis vertikal"
        />
      </Group>
      <Group title="Teks Otomatis">
        <PageNumberMenu d={d} big />
        <DateMenu d={d} big />
        <Menu icon={<Sigma {...lg} />} label="Simbol" title="Sisipkan simbol" big width={190}>
          {(close) => (
            <div>
              <MenuLabel>Simbol</MenuLabel>
              <div className="grid grid-cols-5 gap-1 p-1">
                {SYMBOLS.map((s) => (
                  <button key={s} type="button" title={`Sisipkan ${s}`} onClick={() => { insertSymbol(s); close(); }} className="h-8 rounded border border-gray-200 text-base hover:bg-blue-50">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Menu>
      </Group>
      <Group title="Kolom Data">
        <div className="flex items-center gap-1">
          <select value={fieldKey} onChange={(e) => setFieldKey(e.target.value)} className={`${inputCls} w-44`} title="Pilih field data">
            <option value="">-- pilih field --</option>
            {fields.map((f) => <option key={f.key} value={f.key}>{f.label} ({f.key})</option>)}
          </select>
          <RBtn
            icon={<Columns {...sm} />}
            label="Tambah"
            disabled={!fieldKey}
            title="Tambah kolom data ke tabel"
            onClick={() => {
              const f = fields.find((x) => x.key === fieldKey);
              if (f) d.addColumn(f);
            }}
          />
        </div>
      </Group>
    </>
  );
}

