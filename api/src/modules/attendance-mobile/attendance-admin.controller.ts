import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { AttendanceAdminService } from './attendance-admin.service';

class LocationDto {
  @IsString() @MaxLength(150) name: string;
  @IsOptional() @IsString() @MaxLength(500) address?: string;
  @Type(() => Number) @IsNumber() latitude: number;
  @Type(() => Number) @IsNumber() longitude: number;
  @Type(() => Number) @IsInt() radiusMeters: number;
  @IsString() workStart: string;
  @IsString() workEnd: string;
  @Type(() => Number) @IsInt() lateToleranceMinutes: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class AccountDto {
  @IsString() @MaxLength(50) username: string;
  @IsOptional() @IsString() @MaxLength(100) password?: string;
  @IsOptional() @Type(() => Number) @IsInt() attendanceLocationId?: number | null;
}

@ApiTags('Absensi - HRD')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance-admin')
export class AttendanceAdminController {
  constructor(private readonly service: AttendanceAdminService) {}

  @Get('locations')
  listLocations() {
    return this.service.listLocations();
  }

  @Post('locations')
  createLocation(@Body() dto: LocationDto) {
    return this.service.createLocation(dto);
  }

  @Patch('locations/:id')
  updateLocation(@Param('id', ParseIntPipe) id: number, @Body() dto: LocationDto) {
    return this.service.updateLocation(id, dto);
  }

  @Delete('locations/:id')
  deleteLocation(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteLocation(id);
  }

  @Put('employees/:id/account')
  setAccount(@Param('id', ParseIntPipe) id: number, @Body() dto: AccountDto) {
    return this.service.setAccount(id, dto);
  }

  @Delete('employees/:id/account')
  removeAccount(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeAccount(id);
  }

  @Get('daily')
  daily(@Query('date') date?: string) {
    return this.service.daily(date);
  }

  @Get('photo/:id/:kind')
  async photo(@Param('id', ParseIntPipe) id: number, @Param('kind') kind: string, @Res() reply: any) {
    const { mimeType, data } = await this.service.photo(id, kind);
    reply.header('Content-Type', mimeType).header('Cache-Control', 'private, max-age=3600').send(data);
  }

  @Get('export')
  async export(@Query('from') from: string | undefined, @Query('to') to: string | undefined, @Res() reply: any) {
    const { filename, data } = await this.service.exportXlsx(from, to);
    reply
      .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(data);
  }
}
