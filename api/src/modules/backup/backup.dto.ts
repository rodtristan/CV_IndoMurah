import { IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateBackupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class BackupResponseDto {
  id: string;
  name: string;
  description: string | null;
  filePath: string;
  fileSize: number;
  createdAt: Date;
  createdBy: string;
  isAutomatic: boolean;
}

export class RestoreBackupDto {
  @IsOptional()
  @IsString()
  @IsDateString()
  restorePoint?: string;
}

export class BackupListQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
