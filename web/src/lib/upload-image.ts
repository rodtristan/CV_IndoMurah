import { api } from "@/lib/api-client";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/, "");
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

/** Upload gambar ke API (disimpan di Google Drive). Mengembalikan URL absolut untuk <img src>. */
export async function uploadImage(file: File): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Hanya gambar PNG, JPG, GIF, atau WEBP");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Ukuran gambar maksimal 2 MB");

  const form = new FormData();
  form.append("file", file);
  const token = api.getToken();
  const res = await fetch(`${API_BASE}/files/image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.data?.path) {
    const msg = Array.isArray(json?.message) ? json.message.join(", ") : json?.message;
    throw new Error(msg || "Gagal mengunggah gambar");
  }
  return `${API_BASE}/${json.data.path}`;
}
