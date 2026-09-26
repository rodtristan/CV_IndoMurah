// Form "Pesanan Penjualan" Ketoko: Pelanggan, Sales, Keluar Dari, PPN, Status Pesanan,
// item (Jml Pesan, Harga, Pot %), Tanggal Kirim, Pot %, Biaya, Pjk %, Keterangan, Bayar (DP).
import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString, IsIn, IsBoolean, Min, Max, MaxLength, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';

export const SO_ORDER_STATUSES = ['WAITING_PAYMENT', 'PAID', 'PROCESSED', 'SHIPPED', 'DONE', 'CANCELLED'] as const;

export class CreateSaleOrderItemDto {
  @ApiProperty() @IsInt() ProductID: number;
  @ApiProperty({ description: 'Jml Pesan' }) @IsNumber() @Min(0.001) Quantity: number;
  @ApiProperty() @IsInt() UnitID: number;
  @ApiProperty({ description: 'Harga' }) @IsNumber() @Min(0) UnitPrice: number;
  @ApiPropertyOptional({ description: 'Potongan (nominal)' }) @IsOptional() @IsNumber() @Min(0) DiscountAmount?: number;
  @ApiPropertyOptional({ description: 'Pot %' }) @IsOptional() @IsNumber() @Min(0) @Max(100) DiscountPercent?: number;
}

export class CreateSaleOrderDto {
  @ApiProperty({ description: 'Pelanggan' }) @IsInt() CustomerID: number;
  @ApiPropertyOptional({ description: 'Sales' }) @IsOptional() @IsInt() SalesPersonID?: number | null;
  @ApiPropertyOptional({ description: 'Keluar Dari (Dept/Gudang)' }) @IsOptional() @IsInt() WarehouseID?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsDateString() Date?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() DueDate?: string | null;
  @ApiPropertyOptional({ description: 'Tanggal Kirim' }) @IsOptional() @IsDateString() DeliveryDate?: string | null;

  @ApiPropertyOptional({ enum: SO_ORDER_STATUSES, description: 'Status Pesanan' })
  @IsOptional()
  @IsIn(SO_ORDER_STATUSES as unknown as string[])
  OrderStatus?: string;

  @ApiPropertyOptional({ enum: ['NON', 'INCLUDE', 'EXCLUDE'] }) @IsOptional() @IsIn(['NON', 'INCLUDE', 'EXCLUDE']) TaxMode?: string;
  @ApiPropertyOptional({ description: 'Pjk %' }) @IsOptional() @IsNumber() @Min(0) @Max(100) TaxPercent?: number;
  @ApiPropertyOptional({ description: 'Pot % faktur' }) @IsOptional() @IsNumber() @Min(0) @Max(100) DiscountPercent?: number;
  @ApiPropertyOptional({ description: 'Nom Potongan' }) @IsOptional() @IsNumber() @Min(0) DiscountAmount?: number;
  @ApiPropertyOptional({ description: 'Biaya' }) @IsOptional() @IsNumber() @Min(0) OtherCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() OtherCostAdds?: boolean;

  @ApiPropertyOptional({ description: 'DP pesanan (dicatat sebagai Deposit Pelanggan)' })
  @IsOptional() @IsNumber() @Min(0) DownPayment?: number;
  @ApiPropertyOptional({ description: 'Metode bayar DP' }) @IsOptional() @IsInt() DPMethodID?: number | null;
  @ApiPropertyOptional({ description: 'Akun kas/bank penerima DP' }) @IsOptional() @IsInt() DPAccountID?: number | null;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) Notes?: string | null;

  @ApiProperty({ type: [CreateSaleOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleOrderItemDto)
  Items: CreateSaleOrderItemDto[];
}

/** Edit pesanan: Items (bila dikirim) mengganti seluruh item. */
export class UpdateSaleOrderDto extends PartialType(OmitType(CreateSaleOrderDto, ['Items'] as const)) {
  @ApiPropertyOptional({ type: [CreateSaleOrderItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleOrderItemDto)
  Items?: CreateSaleOrderItemDto[];
}

export class UpdateSaleOrderStatusDto {
  @ApiProperty({ description: 'CONFIRMED | COMPLETED | CANCELLED' }) @IsString() StatusCode: string;
}
