import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateTransferDto {
  @ApiProperty({ description: 'Transfer Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Transfer Date' })
  @IsDateString()
  Date: string;

  @ApiPropertyOptional({ description: 'From account ID (for cash transfer)' })
  @IsOptional()
  @IsNumber()
  FromAccountId?: number;

  @ApiPropertyOptional({ description: 'To account ID (for cash transfer)' })
  @IsOptional()
  @IsNumber()
  ToAccountId?: number;

  @ApiPropertyOptional({ description: 'From warehouse ID (for stock transfer)' })
  @IsOptional()
  @IsNumber()
  FromWarehouseId?: number;

  @ApiPropertyOptional({ description: 'To warehouse ID (for stock transfer)' })
  @IsOptional()
  @IsNumber()
  ToWarehouseId?: number;

  @ApiProperty({ description: 'Transfer Amount' })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class TransferFilterDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'From account ID' })
  @IsOptional()
  @IsNumber()
  FromAccountId?: number;

  @ApiPropertyOptional({ description: 'To account ID' })
  @IsOptional()
  @IsNumber()
  ToAccountId?: number;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Page?: number;

  @ApiPropertyOptional({ description: 'Page size' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class TransferSummaryDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}
