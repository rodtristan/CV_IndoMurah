import { BadRequestException, Body, Controller, Get, HttpCode, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsString, MaxLength } from 'class-validator';
import { AttendanceMobileService, ClockInput } from './attendance-mobile.service';
import { CurrentEmployee, EmployeeAuthGuard } from './employee-auth.guard';

class MobileLoginDto {
  @IsString() @MaxLength(100) username: string;
  @IsString() @MaxLength(200) password: string;
}

const PHOTO_TYPES = new Set(['image/jpeg', 'image/png']);
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

/** Baca multipart: field `photo` (file) + latitude, longitude, accuracy, isMocked, offline, capturedAt. */
async function readClock(req: any): Promise<ClockInput> {
  if (!req.isMultipart?.()) throw new BadRequestException('Kirim sebagai multipart/form-data');
  const fields: Record<string, string> = {};
  let photo: ClockInput['photo'] | undefined;
  for await (const part of req.parts()) {
    if (part.type === 'file') {
      if (part.fieldname !== 'photo') { await part.toBuffer(); continue; }
      if (!PHOTO_TYPES.has(part.mimetype)) throw new BadRequestException('Foto harus JPG atau PNG');
      const data: Buffer = await part.toBuffer();
      if (part.file.truncated || data.length > MAX_PHOTO_BYTES) throw new BadRequestException('Ukuran foto maksimal 2 MB');
      photo = { data, mimeType: part.mimetype };
    } else {
      fields[part.fieldname] = String(part.value ?? '');
    }
  }
  if (!photo?.data.length) throw new BadRequestException('Foto selfie wajib diunggah');
  return {
    latitude: Number(fields.latitude),
    longitude: Number(fields.longitude),
    accuracy: Number(fields.accuracy),
    isMocked: fields.isMocked === 'true',
    offline: fields.offline === 'true',
    capturedAt: fields.capturedAt || undefined,
    photo,
  };
}

@ApiTags('Absensi Mobile')
@Controller('attendance-mobile')
export class AttendanceMobileController {
  constructor(private readonly service: AttendanceMobileService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  login(@Body() dto: MobileLoginDto) {
    return this.service.login(dto.username, dto.password);
  }

  @Get('me')
  @UseGuards(EmployeeAuthGuard)
  @ApiBearerAuth()
  me(@CurrentEmployee() emp: any) {
    return this.service.profile(emp);
  }

  @Get('history')
  @UseGuards(EmployeeAuthGuard)
  @ApiBearerAuth()
  history(@CurrentEmployee() emp: any, @Query('month') month?: string) {
    return this.service.history(emp, month);
  }

  @Post('clock-in')
  @UseGuards(EmployeeAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  async clockIn(@CurrentEmployee() emp: any, @Req() req: any) {
    return this.service.clockIn(emp, await readClock(req));
  }

  @Post('clock-out')
  @UseGuards(EmployeeAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  async clockOut(@CurrentEmployee() emp: any, @Req() req: any) {
    return this.service.clockOut(emp, await readClock(req));
  }
}
