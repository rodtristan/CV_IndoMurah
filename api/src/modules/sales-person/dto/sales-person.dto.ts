// Form Sales Ketoko: data umum + Sistem Komisi (Persentase / Nominal / Persentase Waktu).
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsInt, IsNumber, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { PartnerBaseDto } from '../../../common/dto/partner.dto';

/** Tidak Aktif | Perbarang Harga Jual | Total Faktur | Per Item (dari master item) */
export const COMMISSION_SYSTEMS = ['NONE', 'ITEM_PRICE', 'INVOICE_TOTAL', 'PER_ITEM'] as const;
export const COMMISSION_TYPES = ['PERCENT', 'NOMINAL', 'TIME_PERCENT'] as const;

/** Satu baris "Hari ke X s/d Y — Persentase %". */
export class CommissionTierDto {
  @IsInt() @Min(0) fromDay: number;
  @IsInt() @Min(0) toDay: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100) percent: number;
}

export class CreateSalesPersonDto extends PartnerBaseDto {
  @ApiPropertyOptional({ enum: COMMISSION_SYSTEMS })
  @IsOptional()
  @IsIn(COMMISSION_SYSTEMS as unknown as string[])
  CommissionSystem?: string;

  @ApiPropertyOptional({ enum: COMMISSION_TYPES })
  @IsOptional()
  @IsIn(COMMISSION_TYPES as unknown as string[])
  CommissionType?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100) CommissionPercent?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) CommissionNominal?: number;

  @ApiPropertyOptional({ type: [CommissionTierDto], description: 'Persentase waktu (maks 4 baris)' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => CommissionTierDto)
  CommissionTiers?: CommissionTierDto[] | null;
}

export class UpdateSalesPersonDto extends PartialType(CreateSalesPersonDto) {}
