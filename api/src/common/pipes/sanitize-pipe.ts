// ================================================================
// sanitize.pipe.ts — Pembersih Input dari Karakter Berbahaya
// ================================================================
//
// Pipe ini berjalan SEBELUM data request masuk ke controller.
// Tujuannya: membersihkan semua input dari:
//
//   [1] XSS (Cross-Site Scripting)
//       Serangan di mana hacker menyisipkan script berbahaya.
//       Contoh input berbahaya: <script>alert('hacked')</script>
//       → Akan dihapus otomatis.
//
//   [2] SQL Injection
//       Serangan di mana hacker menyisipkan perintah SQL.
//       Contoh input berbahaya: '; DROP TABLE users; --
//       → Pola berbahaya akan dihapus.
//
//   [3] Input terlalu panjang
//       Input lebih dari 10.000 karakter akan ditolak (400 Bad Request).
//
// Pipe ini didaftarkan secara global di main.ts sehingga berlaku
// untuk SEMUA endpoint tanpa perlu menambahkan decorator satu per satu.
//
// Urutan pipe: SanitizePipe → ValidationPipe → Controller
// ================================================================

import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class SanitizePipe implements PipeTransform {
  // transform() dipanggil untuk setiap nilai yang masuk (body, query, param)
  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    return this.sanitize(value);
  }

  // Rekursif: proses semua tipe data (string, array, object)
  private sanitize(value: unknown): unknown {
    if (typeof value === 'string') {
      return this.cleanString(value); // Bersihkan string satu per satu
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item)); // Proses tiap elemen array
    }

    if (value !== null && typeof value === 'object') {
      // Proses tiap field di dalam object/body JSON
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        // Field password TIDAK boleh disanitasi/di-trim: query password selalu
        // lewat Prisma (parameterized), jadi tidak butuh anti-SQLi, dan
        // memotong karakter (--, /*, spasi di ujung, dll) diam-diam mengubah
        // password asli user sebelum di-hash — user login dengan password
        // yang berbeda dari yang mereka kira mereka daftarkan.
        result[key] = this.isPasswordField(key) ? val : this.sanitize(val);
      }
      return result;
    }

    // Tipe lain (number, boolean, null) langsung dikembalikan tanpa diubah
    return value;
  }

  private isPasswordField(key: string): boolean {
    return /password/i.test(key);
  }

  private cleanString(str: string): string {
    let clean = str
      // ── Anti XSS ────────────────────────────────────────────────────
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')  // Hapus tag <script>
      .replace(/<[^>]+on\w+="[^"]*"/gi, '')                 // Hapus event handler (onclick, dll)
      .replace(/<[^>]+on\w+='[^']*'/gi, '')                 // Hapus event handler (versi quote tunggal)
      .replace(/javascript:/gi, '')                          // Hapus href="javascript:..."
      .replace(/vbscript:/gi, '')                            // Hapus vbscript (IE lama)
      .replace(/data:/gi, '')                                // Hapus data: URI (bisa payload XSS)

      // ── Anti SQL Injection ───────────────────────────────────────────
      .replace(/;\s*(DROP|ALTER|CREATE|TRUNCATE|INSERT|UPDATE|DELETE)\s/gi, '') // Hapus perintah SQL berbahaya
      .replace(/--/g, '')    // Hapus komentar SQL (--)
      .replace(/\/\*/g, '')  // Hapus komentar SQL blok (/* ... */)
      .replace(/\*\//g, '');

    // ── Batasi panjang string ────────────────────────────────────────
    // Ini mencegah serangan "input besar" yang bisa membebani server
    if (clean.length > 10000) {
      throw new BadRequestException(
        'Input terlalu panjang. Maksimal 10.000 karakter per field.',
      );
    }

    return clean.trim();
  }
}
