// ================================================================
// hash-id.service.ts — Menyembunyikan ID Asli di URL
// ================================================================
//
// Masalah: Jika API menggunakan ID angka langsung di URL,
//   GET /products/1, GET /products/2, GET /products/3 ...
//   → Orang bisa dengan mudah menebak dan mencoba semua ID.
//
// Solusi: Encode ID dengan library Hashids.
//   ID asli  : 1   → Hash : "aBcDeF12"
//   ID asli  : 2   → Hash : "xYzWqR45"
//
// URL yang aman: GET /products/aBcDeF12
//
// Cara pakai di controller:
//   // Encode (kirim ke frontend)
//   const safeId = this.hashId.encode(product.id);
//
//   // Decode (terima dari URL)
//   const realId = this.hashId.decode(params.id);
//
// HashIdModule sudah di-set sebagai @Global() sehingga bisa
// di-inject ke service manapun tanpa perlu import modul lagi.
//
// Konfigurasi via .env:
//   HASH_ID_SALT       = string unik (WAJIB diganti, jaga kerahasiaannya!)
//   HASH_ID_MIN_LENGTH = panjang minimum hash (default: 8 karakter)
// ================================================================

import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Hashids from 'hashids';

@Injectable()
export class HashIdService {
  private readonly hashids: Hashids;

  constructor(private config: ConfigService) {
    const salt = config.get<string>('security.hashIdSalt', 'toko-cv-indomurah-default-salt');
    const minLength = config.get<number>('security.hashIdMinLength', 8);
    this.hashids = new Hashids(salt, minLength);
  }

  /**
   * Ubah ID angka menjadi string hash yang aman untuk URL.
   * Contoh: encode(123) → "aBcDeF12"
   */
  encode(id: number): string {
    return this.hashids.encode(id);
  }

  /**
   * Kembalikan hash ke ID angka asli.
   * Contoh: decode("aBcDeF12") → 123
   * Throw BadRequestException jika hash tidak valid.
   */
  decode(hash: string): number {
    const decoded = this.hashids.decode(hash);
    if (!decoded.length) {
      throw new BadRequestException(
        `ID tidak valid: "${hash}". Format ID tidak dikenali.`,
      );
    }
    return decoded[0] as number;
  }

  /** Encode banyak ID sekaligus (untuk daftar/list) */
  encodeMany(ids: number[]): string[] {
    return ids.map((id) => this.encode(id));
  }

  /** Decode banyak hash sekaligus */
  decodeMany(hashes: string[]): number[] {
    return hashes.map((h) => this.decode(h));
  }
}
