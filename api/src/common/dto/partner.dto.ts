// Field bersama form Pelanggan / Supplier / Sales di Ketoko
// (Kode, Nama, Alamat, Kota, Provinsi, Negara, Kode Pos, Telepon, Fax,
//  Kontak, E-mail, No Rek., Rek. A/N, Bank, NPWP, Keterangan).
// PascalCase = nama kolom Prisma; nilai null diizinkan untuk mengosongkan field saat edit.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsIn, IsNumber, IsOptional, IsString, MaxLength, Max, Min, ValidateIf } from 'class-validator';

const Str = (max: number) => (target: object, key: string) => {
  IsOptional()(target, key);
  IsString()(target, key);
  MaxLength(max)(target, key);
};

export const TAX_MODES = ['DEFAULT', 'NON', 'INCLUDE', 'EXCLUDE'] as const;
export const TAX_VALUE_SOURCES = ['DEFAULT', 'PARTNER', 'ITEM'] as const;

export class PartnerBaseDto {
  @ApiProperty({ description: 'Kode' })
  @IsString()
  @MaxLength(50)
  Code: string;

  @ApiProperty({ description: 'Nama' })
  @IsString()
  @MaxLength(255)
  Name: string;

  @ApiPropertyOptional() @Str(500) Address?: string | null;
  @ApiPropertyOptional() @Str(100) City?: string | null;
  @ApiPropertyOptional() @Str(100) Province?: string | null;
  @ApiPropertyOptional() @Str(100) Country?: string | null;
  @ApiPropertyOptional() @Str(20) PostalCode?: string | null;
  @ApiPropertyOptional() @Str(50) Phone?: string | null;
  @ApiPropertyOptional() @Str(50) Fax?: string | null;
  @ApiPropertyOptional({ description: 'Kontak' }) @Str(255) ContactPerson?: string | null;

  @ApiPropertyOptional({ description: 'E-mail' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== '')
  @IsEmail({}, { message: 'Format e-mail tidak valid' })
  @MaxLength(255)
  Email?: string | null;

  @ApiPropertyOptional({ description: 'No. Rekening' }) @Str(50) BankAccountNumber?: string | null;
  @ApiPropertyOptional({ description: 'Rekening A/N' }) @Str(150) BankAccountName?: string | null;
  @ApiPropertyOptional({ description: 'Bank' }) @Str(100) BankName?: string | null;
  @ApiPropertyOptional({ description: 'NPWP' }) @Str(50) TaxID?: string | null;
  @ApiPropertyOptional({ description: 'Keterangan' }) @Str(1000) Notes?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

/** Opsi pajak di form Pelanggan & Supplier ("Menggunakan Pajak", "Nilai Pajak diset Dari", "Nilai Pajak"). */
export class PartnerTaxDto extends PartnerBaseDto {
  @ApiPropertyOptional({ description: 'Jatuh tempo (hari), 0 = mengacu pengaturan' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  DueDays?: number;

  @ApiPropertyOptional({ enum: TAX_MODES })
  @IsOptional()
  @IsIn(TAX_MODES as unknown as string[])
  TaxMode?: string;

  @ApiPropertyOptional({ enum: TAX_VALUE_SOURCES })
  @IsOptional()
  @IsIn(TAX_VALUE_SOURCES as unknown as string[])
  TaxValueSource?: string;

  @ApiPropertyOptional({ description: 'Nilai pajak (%)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  TaxRate?: number;
}
