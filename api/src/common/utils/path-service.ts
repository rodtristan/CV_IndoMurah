// ================================================================
// path-service.ts — Pengelola Path File & Folder Upload
// ================================================================
//
// Semua operasi file di aplikasi ini menggunakan class ini agar:
//   - Path selalu konsisten (tidak ada yang hardcode string path sendiri)
//   - Mudah diubah jika struktur folder berubah (cukup ubah di sini)
//   - Bisa dipakai di Windows maupun Linux tanpa masalah separator (/ vs \)
//
// Struktur folder upload (sesuai standar URL path):
//   upload/
//   ├── photo/       ← Foto produk, foto profil, dll
//   ├── document/    ← Dokumen (invoice, surat jalan, dll)
//   ├── other/       ← File lain yang tidak masuk kategori di atas
//   └── report/      ← Laporan yang di-generate sistem
//
// URL publik yang sesuai:
//   http://localhost:5000/upload/photo/foto.jpg
//   http://localhost:5000/upload/document/invoice.pdf
//   http://localhost:5000/upload/other/file.xlsx
//   http://localhost:5000/upload/report/laporan.pdf
//
// Semua folder ini dibuat otomatis saat server start (di main.ts).
// ================================================================

import * as path from 'path';
import * as fs from 'fs';

export class PathService {
  // Root folder = folder tempat server dijalankan (folder `api/`)
  private static readonly ROOT = path.resolve(process.cwd());

  // ── Folder Utama ─────────────────────────────────────────────────

  /** Root folder semua upload: <cwd>/upload/ */
  static uploadDir(): string {
    return path.join(this.ROOT, 'upload');
  }

  // ── Folder per Kategori ───────────────────────────────────────────
  // URL: /upload/photo/

  /** Foto produk, profil, dll */
  static photoDir(): string {
    return path.join(this.uploadDir(), 'photo');
  }

  /** Dokumen: invoice, surat jalan, kontrak, dll */
  static documentDir(): string {
    return path.join(this.uploadDir(), 'document');
  }

  /** File lain yang tidak masuk kategori photo/document/report */
  static otherDir(): string {
    return path.join(this.uploadDir(), 'other');
  }

  /** Laporan yang di-generate oleh sistem (PDF, Excel) */
  static reportDir(): string {
    return path.join(this.uploadDir(), 'report');
  }

  // ── Helper: Path ke File Spesifik ────────────────────────────────

  /** Path lengkap ke sebuah file foto */
  static photoFile(filename: string): string {
    return path.join(this.photoDir(), filename);
  }

  /** Path lengkap ke sebuah file dokumen */
  static documentFile(filename: string): string {
    return path.join(this.documentDir(), filename);
  }

  /** Path lengkap ke sebuah file other */
  static otherFile(filename: string): string {
    return path.join(this.otherDir(), filename);
  }

  /** Path lengkap ke sebuah file laporan */
  static reportFile(filename: string): string {
    return path.join(this.reportDir(), filename);
  }

  // ── Folder Management ─────────────────────────────────────────────

  /**
   * Buat folder jika belum ada.
   * `recursive: true` → buat parent folder juga jika belum ada.
   */
  static ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Buat semua folder upload yang dibutuhkan aplikasi.
   * Dipanggil di main.ts saat server pertama kali start.
   *
   * Struktur yang dibuat:
   *   upload/
   *   ├── photo/
   *   ├── document/
   *   ├── other/
   *   └── report/
   */
  static ensureAllDirs(): void {
    const dirs = [
      this.uploadDir(),
      this.photoDir(),
      this.documentDir(),
      this.otherDir(),
      this.reportDir(),
    ];
    dirs.forEach((dir) => this.ensureDir(dir));
  }

  /**
   * Konversi path absolut disk ke URL publik.
   *
   * Contoh:
   *   /app/upload/photo/foto.jpg  →  /upload/photo/foto.jpg
   *   /app/upload/report/lap.pdf  →  /upload/report/lap.pdf
   */
  static toPublicUrl(absolutePath: string): string {
    return absolutePath.replace(this.ROOT, '').replace(/\\/g, '/');
  }
}
