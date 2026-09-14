// ================================================================
// auth-controller.ts — HTTP Controller untuk Autentikasi
// ================================================================
//
//   POST /api/v1/auth/login    → Login
//   POST /api/v1/auth/register → Register
//   GET  /api/v1/auth/me       → Profil user yang login (butuh token)
//
// @Throttle di login/register: batasi percobaan lebih ketat daripada
// limit global (lihat app-module.ts) untuk mempersulit brute-force
// terhadap password / email enumeration.
// ================================================================

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth-service';
import { LoginDto, RegisterDto } from './dto/auth-dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Login - Masuk dengan email & password' })
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return ApiResponse.ok(data, 'Login berhasil');
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register - Daftarkan user baru' })
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return ApiResponse.ok(data, 'Registrasi berhasil');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil - Ambil data user yang sedang login' })
  async getMe(@CurrentUser() user: { id: string }) {
    const data = await this.authService.getMe(user.id);
    if (!data) throw new NotFoundException('User tidak ditemukan');
    return ApiResponse.ok(data, 'Berhasil mengambil profil');
  }
}
