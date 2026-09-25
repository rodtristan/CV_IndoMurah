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

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { resolveJwtSecret } from '../../config/jwt-config';
import { AuthzService } from '../auth/authz-service';

// PassportStrategy(Strategy) = kombinasi NestJS Passport + JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authz: AuthzService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Harus sama dengan kunci yang dipakai AuthModule saat sign.
      // resolveJwtSecret() fail-fast di production bila JWT_SECRET kosong/pendek.
      secretOrKey: resolveJwtSecret(),
    });
  }

  // validate() dipanggil setelah signature & expiry token terverifikasi.
  // Hasilnya disimpan ke req.user (akses via @CurrentUser()).
  async validate(payload: { id: string; companyId: number; username: string; roleId?: number; typ?: string }) {
    // Token aplikasi absensi karyawan (typ 'employee') tidak boleh dipakai untuk API back office.
    if (!payload?.id || payload.typ === 'employee') throw new UnauthorizedException('Token tidak valid');

    // Tolak token milik user yang sudah dihapus / dinonaktifkan (cache Redis 30 detik).
    const access = await this.authz.getAccess(payload.id);
    if (!access.exists || !access.isActive) {
      throw new UnauthorizedException('Akun tidak aktif. Silakan hubungi administrator.');
    }

    return {
      id: payload.id,
      companyId: payload.companyId,
      username: payload.username,
      roleId: payload.roleId,
    };
  }
}
