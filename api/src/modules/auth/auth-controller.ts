// ================================================================
// auth-controller.ts — HTTP Controller untuk Autentikasi
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
  @ApiOperation({ summary: 'Login - Masuk dengan Company Code, Username & Password' })
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return ApiResponse.ok(data, 'Login berhasil');
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register - Daftarkan user baru dengan Company Code' })
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
