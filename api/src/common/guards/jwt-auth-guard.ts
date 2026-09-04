// ================================================================
// jwt-auth-guard.ts — Penjaga Endpoint yang Butuh Login
// ================================================================
//
// Guard adalah "penjaga pintu" yang menentukan apakah request boleh
// masuk ke controller atau tidak.
//
// JwtAuthGuard dipakai di endpoint yang HANYA boleh diakses oleh
// user yang sudah login (punya JWT token yang valid).
//
// Cara pakai di controller:
//
//   @UseGuards(JwtAuthGuard)       ← Pasang guard
//   @Get('profile')
//   getProfile(@CurrentUser() user) {
//     return user; // req.user sudah terisi oleh JwtStrategy
//   }
//
// Jika tidak ada token / token invalid → otomatis 401 Unauthorized
// ================================================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// AuthGuard('jwt') = gunakan JWT strategy yang sudah kita definisikan
// di jwt-strategy.ts (nama 'jwt' adalah nama default dari passport-jwt)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // handleRequest() dipanggil setelah Passport memproses token
  // err  : error dari proses validasi
  // user : data dari validate() di jwt-strategy.ts (atau null jika invalid)
  handleRequest(err: any, user: any) {
    // Jika ada error atau user tidak terisi → tolak request
    if (err || !user) {
      throw err || new UnauthorizedException('Token tidak valid atau sudah expired. Silakan login ulang.');
    }
    // User valid → kembalikan user (akan disimpan di req.user)
    return user;
  }
}
