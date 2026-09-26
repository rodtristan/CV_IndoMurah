import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString, IsIn, IsBoolean, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  ProductID: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  Quantity: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsInt()
  UnitID?: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  UnitPrice: number;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  DiscountAmount?: number;
}

/** Satu baris pembayaran di dialog "Bayar" penjualan. */
export class SalePaymentLineDto {
  @ApiPropertyOptional({ description: 'Metode (Tunai, Kartu Debit, Kartu Kredit, E-Wallet, ...)' })
  @IsOptional()
  @IsInt()
  MethodID?: number;

  @ApiPropertyOptional({ enum: ['CASH', 'DEPOSIT', 'CEK', 'BG'], description: 'DEPOSIT = Bayar Deposit / DP SO' })
  @IsOptional()
  @IsIn(['CASH', 'DEPOSIT', 'CEK', 'BG'])
  InstrumentType?: string;

  @ApiProperty() @IsNumber() @Min(0) Amount: number;
  @ApiPropertyOptional({ description: 'Akun kas/bank' }) @IsOptional() @IsInt() AccountID?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) ReferenceNumber?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() DueDate?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) Notes?: string | null;
}

export class CreateSaleDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsInt()
  CustomerID: number;

  @ApiPropertyOptional({ description: 'Sales person ID' })
  @IsOptional()
  @IsInt()
  SalesPersonID?: number | null;

  @ApiPropertyOptional({ description: 'Sale point ID' })
  @IsOptional()
  @IsInt()
  SalePointID?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  WarehouseID?: number;

  @ApiPropertyOptional({ description: 'Sale date', type: String })
  @IsOptional()
  @IsString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Due date for credit sales', type: String })
  @IsOptional()
  @IsString()
  DueDate?: string;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  DiscountAmount?: number;

  @ApiPropertyOptional({ description: 'Tax percent' })
  @IsOptional()
  @IsNumber()
  TaxPercent?: number;

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsInt()
  PaymentMethodID?: number;

  @ApiPropertyOptional({ description: 'Cash amount received (for cash payments)' })
  @IsOptional()
  @IsNumber()
  CashAmount?: number;

  @ApiPropertyOptional({ description: 'Voucher ID (divalidasi: aktif, periode, kuota, minimal belanja)' })
  @IsOptional()
  @IsInt()
  VoucherID?: number;

  @ApiPropertyOptional({ description: 'Kode voucher (alternatif VoucherID)' })
  @IsOptional()
  @IsString()
  VoucherCode?: string;

  @ApiPropertyOptional({ description: 'Alias camelCase untuk PaymentMethodID' })
  @IsOptional()
  @IsInt()
  paymentMethodId?: number;

  @ApiPropertyOptional({ description: 'Alias camelCase untuk WarehouseID' })
  @IsOptional()
  @IsInt()
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiProperty({ description: 'Sale items', type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  Items: CreateSaleItemDto[];
  @ApiPropertyOptional({ enum: ['NON', 'INCLUDE', 'EXCLUDE'], description: 'PPN' })
  @IsOptional()
  @IsIn(['NON', 'INCLUDE', 'EXCLUDE'])
  TaxMode?: string;

  @ApiPropertyOptional({ description: 'Biaya' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  OtherCost?: number;

  @ApiPropertyOptional({ description: 'Biaya ditambahkan ke total' })
  @IsOptional()
  @IsBoolean()
  OtherCostAdds?: boolean;

  @ApiPropertyOptional({ description: 'No. referensi / PO pelanggan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ReferenceNo?: string | null;

  @ApiPropertyOptional({ description: 'Pesanan Penjualan yang dipenuhi' })
  @IsOptional()
  @IsInt()
  SaleOrderID?: number | null;

  @ApiPropertyOptional({ description: 'Alamat Kirim: nama penerima' }) @IsOptional() @IsString() @MaxLength(255) ShipName?: string | null;
  @ApiPropertyOptional({ description: 'Alamat Kirim: alamat' }) @IsOptional() @IsString() @MaxLength(1000) ShipAddress?: string | null;
  @ApiPropertyOptional({ description: 'Alamat Kirim: kota' }) @IsOptional() @IsString() @MaxLength(100) ShipCity?: string | null;
  @ApiPropertyOptional({ description: 'Alamat Kirim: telepon' }) @IsOptional() @IsString() @MaxLength(50) ShipPhone?: string | null;
  @ApiPropertyOptional({ description: 'Kurir / expedisi' }) @IsOptional() @IsString() @MaxLength(100) Courier?: string | null;

  @ApiPropertyOptional({ type: [() => SalePaymentLineDto], description: 'Bayar: DP SO / Tunai / Deposit / Debit / Kartu Kredit / E-Money (sisanya = Kredit)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalePaymentLineDto)
  Payments?: SalePaymentLineDto[];
}

export class UpdateSaleDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsInt()
  CustomerID?: number;

  @ApiPropertyOptional({ description: 'Sales person ID' })
  @IsOptional()
  @IsInt()
  SalesPersonID?: number | null;

  @ApiPropertyOptional({ description: 'Sale point ID' })
  @IsOptional()
  @IsInt()
  SalePointID?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  WarehouseID?: number;

  @ApiPropertyOptional({ description: 'Sale date', type: String })
  @IsOptional()
  @IsString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Due date', type: String })
  @IsOptional()
  @IsString()
  DueDate?: string;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  DiscountAmount?: number;

  @ApiPropertyOptional({ description: 'Tax percent' })
  @IsOptional()
  @IsNumber()
  TaxPercent?: number;

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsInt()
  PaymentMethodID?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
  @ApiPropertyOptional({ enum: ['NON', 'INCLUDE', 'EXCLUDE'], description: 'PPN' })
  @IsOptional()
  @IsIn(['NON', 'INCLUDE', 'EXCLUDE'])
  TaxMode?: string;

  @ApiPropertyOptional({ description: 'Biaya' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  OtherCost?: number;

  @ApiPropertyOptional({ description: 'Biaya ditambahkan ke total' })
  @IsOptional()
  @IsBoolean()
  OtherCostAdds?: boolean;

  @ApiPropertyOptional({ description: 'No. referensi / PO pelanggan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ReferenceNo?: string | null;

  @ApiPropertyOptional({ description: 'Pesanan Penjualan yang dipenuhi' })
  @IsOptional()
  @IsInt()
  SaleOrderID?: number | null;

  @ApiPropertyOptional({ description: 'Alamat Kirim: nama penerima' }) @IsOptional() @IsString() @MaxLength(255) ShipName?: string | null;
  @ApiPropertyOptional({ description: 'Alamat Kirim: alamat' }) @IsOptional() @IsString() @MaxLength(1000) ShipAddress?: string | null;
  @ApiPropertyOptional({ description: 'Alamat Kirim: kota' }) @IsOptional() @IsString() @MaxLength(100) ShipCity?: string | null;
  @ApiPropertyOptional({ description: 'Alamat Kirim: telepon' }) @IsOptional() @IsString() @MaxLength(50) ShipPhone?: string | null;
  @ApiPropertyOptional({ description: 'Kurir / expedisi' }) @IsOptional() @IsString() @MaxLength(100) Courier?: string | null;

  @ApiPropertyOptional({ type: [CreateSaleItemDto], description: 'Mengganti seluruh item (stok disesuaikan)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  Items?: CreateSaleItemDto[];
}

export class PaymentDto {
  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  Amount: number;

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsInt()
  PaymentMethodID?: number;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ description: 'Payment status code (e.g., PENDING, PARTIAL, PAID, CANCELLED)' })
  @IsString()
  PaymentStatusCode: string;
}

export class UpdateShippingDto {
  @ApiPropertyOptional({ description: 'Shipping status', enum: ['PENDING', 'SHIPPED'] })
  @IsOptional()
  @IsString()
  ShippingStatus?: string;

  @ApiPropertyOptional({ description: 'Shipping date', type: String })
  @IsOptional()
  @IsString()
  ShippingDate?: string;

  @ApiPropertyOptional({ description: 'Tracking / resi number' })
  @IsOptional()
  @IsString()
  TrackingNumber?: string;

  @ApiPropertyOptional({ description: 'Kurir' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  Courier?: string;
}
