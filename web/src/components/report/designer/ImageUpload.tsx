"use client";

import { useRef, useState, type ReactNode } from "react";
import { uploadImage } from "@/lib/upload-image";

/** Tombol pilih file gambar; hasil upload dikembalikan sebagai URL lewat onUploaded. */
export function ImageUpload({
  onUploaded,
  className,
  children,
}: {
  onUploaded: (url: string) => void;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pick = async (file?: File) => {
    if (!file) return;
    setErr("");
    setBusy(true);
    try {
      onUploaded(await uploadImage(file));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden onChange={(e) => void pick(e.target.files?.[0])} />
      <button
        type="button"
        disabled={busy}
        onClick={() => ref.current?.click()}
        className={className ?? "w-full rounded bg-[#1e4d8f] px-2 py-1 text-xs text-white disabled:opacity-40"}
      >
        {busy ? "Mengunggah..." : (children ?? "Pilih File Gambar")}
      </button>
      {err && <div className="mt-1 text-[11px] text-red-600">{err}</div>}
    </div>
  );
}
