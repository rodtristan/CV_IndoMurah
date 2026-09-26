// Form Pelanggan Ketoko: tab "Data Umum" + tab "Data Pendukung Pajak".
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PartnerTaxDto } from '../../../common/dto/partner.dto';

/** Tipe Potongan: Pot. Daftar Item | Pot. Grup Per Item | Pot. Grup Per Faktur */
export const CUSTOMER_DISCOUNT_TYPES = ['ITEM_LIST', 'GROUP_PER_ITEM', 'GROUP_PER_INVOICE'] as const;

export class CreateCustomerDto extends PartnerTaxDto {
  @ApiPropertyOptional({ description: 'Limit jumlah piutang (0 = tanpa limit)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  CreditLimit?: number;

  @ApiPropertyOptional({ description: 'Limit hari piutang (0 = tanpa limit)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  CreditDayLimit?: number;

  @ApiPropertyOptional({ description: 'Max jumlah kredit per nota (0 = tanpa limit)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  MaxCreditAmount?: number;

  @ApiPropertyOptional({ description: 'Grup pelanggan' })
  @IsOptional()
  @IsInt()
  CustomerGroupID?: number;

  @ApiPropertyOptional({ enum: CUSTOMER_DISCOUNT_TYPES })
  @IsOptional()
  @IsIn(CUSTOMER_DISCOUNT_TYPES as unknown as string[])
  DiscountType?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() RegionID?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() SubRegionID?: number | null;
  @ApiPropertyOptional({ description: 'Sales' }) @IsOptional() @IsInt() SalesPersonID?: number | null;

  // ── Data Pendukung Pajak (NPWP = TaxID di Data Umum) ──
  @ApiPropertyOptional({ description: 'NIK' }) @IsOptional() @IsString() @MaxLength(50) TaxNIK?: string | null;
  @ApiPropertyOptional({ description: 'Nama NPWP' }) @IsOptional() @IsString() @MaxLength(255) TaxName?: string | null;
  @ApiPropertyOptional({ description: 'Alamat NPWP' }) @IsOptional() @IsString() @MaxLength(500) TaxAddress?: string | null;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
