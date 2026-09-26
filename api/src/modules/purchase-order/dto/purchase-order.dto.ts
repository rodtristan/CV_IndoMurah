// Form "Pesanan Pembelian" Ketoko: Supplier, Status Pesanan, Masuk Ke, PPN, Tanggal Kirim,
// item (Jumlah, Harga, Pot %), Pot %, Biaya, Pjk %, Titip/DP, Keterangan.
import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString, IsIn, IsBoolean, Min, Max, MaxLength, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';

export const PO_ORDER_STATUSES = ['WAITING_PAYMENT', 'PAID', 'PROCESSED', 'SHIPPED', 'DONE', 'CANCELLED'] as const;

export class CreatePurchaseOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  ProductID: number;

  @ApiProperty({ description: 'Jumlah pesan' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  UnitID: number;

  @ApiProperty({ description: 'Harga' })
  @IsNumber()
  @Min(0)
  UnitPrice: number;

  @ApiPropertyOptional({ description: 'Potongan (nominal)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DiscountAmount?: number;

  @ApiPropertyOptional({ description: 'Pot %' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  DiscountPercent?: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsInt()
  SupplierID: number;

  @ApiPropertyOptional({ description: 'Masuk Ke (Dept/Gudang)' })
  @IsOptional()
  @IsInt()
  WarehouseID?: number;

  @ApiPropertyOptional({ description: 'Tanggal' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Jatuh tempo' })
  @IsOptional()
  @IsDateString()
  DueDate?: string | null;

  @ApiPropertyOptional({ description: 'Tanggal Kirim' })
  @IsOptional()
  @IsDateString()
  DeliveryDate?: string | null;

  @ApiPropertyOptional({ enum: PO_ORDER_STATUSES, description: 'Status Pesanan' })
  @IsOptional()
  @IsIn(PO_ORDER_STATUSES as unknown as string[])
  OrderStatus?: string;

  @ApiPropertyOptional({ enum: ['NON', 'INCLUDE', 'EXCLUDE'], description: 'PPN' })
  @IsOptional()
  @IsIn(['NON', 'INCLUDE', 'EXCLUDE'])
  TaxMode?: string;

  @ApiPropertyOptional({ description: 'Pjk %' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  TaxPercent?: number;

  @ApiPropertyOptional({ description: 'Pot % faktur' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Potongan faktur (nominal)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DiscountAmount?: number;

  @ApiPropertyOptional({ description: 'Biaya' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  OtherCost?: number;

  @ApiPropertyOptional({ description: 'Biaya ditambahkan ke total' })
  @IsOptional()
  @IsBoolean()
  OtherCostAdds?: boolean;

  @ApiPropertyOptional({ description: 'Titip / DP ke supplier' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DownPayment?: number;

  @ApiPropertyOptional({ description: 'Keterangan' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  Notes?: string | null;

  @ApiProperty({ description: 'Item', type: [CreatePurchaseOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  Items: CreatePurchaseOrderItemDto[];
}

/** Edit pesanan: semua field boleh diubah; Items (bila dikirim) mengganti seluruh item. */
export class UpdatePurchaseOrderDto extends PartialType(OmitType(CreatePurchaseOrderDto, ['Items'] as const)) {
  @ApiPropertyOptional({ type: [CreatePurchaseOrderItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  Items?: CreatePurchaseOrderItemDto[];
}

export class UpdatePurchaseOrderStatusDto {
  @ApiProperty({ description: 'New status code' })
  @IsString()
  StatusCode: string;
}

export class AddPurchaseOrderItemDto extends CreatePurchaseOrderItemDto {}
