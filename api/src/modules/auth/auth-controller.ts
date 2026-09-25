// ================================================================
// auth-controller.ts — HTTP Controller untuk Autentikasi
// ================================================================

import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth-service';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth-dto';
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
  @ApiOperation({ summary: 'Login - Masuk dengan Company Code, Username & Password' })
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return ApiResponse.ok(data, 'Login berhasil');
  }

  // Bukan lagi pendaftaran publik: hanya Administrator yang sudah login
  // (JwtAuthGuard di sini + AdminRouteGuard global untuk prefix auth/register).
  // Web membuat user lewat POST /users.
  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register - Administrator membuat user baru (butuh login admin)' })
  async register(@Body() dto: RegisterDto, @CurrentUser() user: { id: string; companyId: number }) {
    const data = await this.authService.register(dto, user);
    return ApiResponse.ok(data, 'Registrasi berhasil');
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Ganti password user yang sedang login' })
  async changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: { id: string }) {
    const data = await this.authService.changePassword(user.id, dto);
    return ApiResponse.ok(data, 'Password berhasil diubah');
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
