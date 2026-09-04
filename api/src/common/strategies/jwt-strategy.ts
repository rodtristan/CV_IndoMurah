// ================================================================
// jwt-strategy.ts — Strategi Validasi JWT Token
// ================================================================
//
// ── APA ITU JWT STRATEGY? ────────────────────────────────────────
//
// JWT Strategy adalah "validator" yang dijalankan oleh Passport.js
// setiap kali ada request dengan header Authorization: Bearer <token>.
//
// Alur kerja:
//   Request masuk dengan header Authorization: Bearer eyJ...
//       ↓
//   JwtAuthGuard (@UseGuards(JwtAuthGuard)) menyadap request
//       ↓
//   Passport memanggil JwtStrategy ini
//       ↓
//   ExtractJwt.fromAuthHeaderAsBearerToken()
//   → Ambil token dari header Authorization
//       ↓
//   Verifikasi signature JWT dengan JWT_SECRET
//   → Jika tidak valid / expired → 401 Unauthorized
//       ↓
//   validate(payload) dipanggil dengan isi token
//   → Kembalikan data user → disimpan di req.user
//       ↓
//   Controller menerima request dengan req.user sudah terisi
// ================================================================

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// PassportStrategy(Strategy) = kombinasi NestJS Passport + JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Cara mengambil token dari request:
      // fromAuthHeaderAsBearerToken() → ambil dari header "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // ignoreExpiration: false → tolak token yang sudah expired
      // (selalu set false di production!)
      ignoreExpiration: false,

      // secretOrKey: kunci rahasia untuk verifikasi JWT signature
      // Harus sama dengan kunci yang dipakai saat sign (di AuthService.login)
      // Nilai diambil dari .env: JWT_SECRET
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  // validate() dipanggil setelah token BERHASIL diverifikasi
  // payload = isi token yang sudah didecode (data yang kita simpan saat login)
  // Response dari method ini akan OTOMATIS disimpan ke req.user
  async validate(payload: { id: number; email: string; role_id?: number }) {
    // Kembalikan data yang kita mau ada di req.user
    // Di controller, kita bisa akses dengan: @CurrentUser() user
    return {
      id:      payload.id,
      email:   payload.email,
      role_id: payload.role_id,
    };
  }
}
