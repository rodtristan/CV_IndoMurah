import { Body, Controller, Get, Headers, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { PushService } from './push.service';
import { PushSubscribeDto, PushUnsubscribeDto } from './dto/push.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('push')
export class PushController {
  constructor(private readonly push: PushService) {}

  @Get('public-key')
  @ApiOperation({ summary: 'Kunci publik VAPID untuk PushManager.subscribe()' })
  publicKey() {
    return { success: true, data: { publicKey: this.push.getPublicKey() } };
  }

  @Get('status')
  @ApiOperation({ summary: 'Jumlah perangkat user ini yang menerima notifikasi push' })
  async status(@CurrentUser('id') userId: string) {
    return { success: true, data: { devices: await this.push.countForUser(userId) } };
  }

  @Post('subscribe')
  @HttpCode(200)
  @ApiOperation({ summary: 'Daftarkan browser/perangkat ini untuk notifikasi push' })
  async subscribe(
    @CurrentUser('id') userId: string,
    @Body() dto: PushSubscribeDto,
    @Headers('user-agent') userAgent?: string,
  ) {
    this.push.getPublicKey(); // 503 bila push belum dikonfigurasi
    await this.push.subscribe(userId, { endpoint: dto.endpoint, p256dh: dto.keys.p256dh, auth: dto.keys.auth }, userAgent);
    return { success: true, message: 'Notifikasi perangkat diaktifkan' };
  }

  @Post('unsubscribe')
  @HttpCode(200)
  @ApiOperation({ summary: 'Berhenti menerima notifikasi push di perangkat ini' })
  async unsubscribe(@CurrentUser('id') userId: string, @Body() dto: PushUnsubscribeDto) {
    await this.push.unsubscribe(userId, dto.endpoint);
    return { success: true, message: 'Notifikasi perangkat dimatikan' };
  }

  @Post('test')
  @HttpCode(200)
  @ApiOperation({ summary: 'Kirim notifikasi uji ke semua perangkat user ini' })
  async test(@CurrentUser('id') userId: string) {
    this.push.getPublicKey();
    const sent = await this.push.send(userId, {
      title: 'Notifikasi uji',
      body: 'Notifikasi CV IndoMurah sudah aktif di perangkat ini.',
      url: '/dashboard',
      tag: 'push-test',
      typeCode: 'INFO',
    });
    return { success: true, data: { sent }, message: sent ? `Terkirim ke ${sent} perangkat` : 'Belum ada perangkat yang aktif' };
  }
}
