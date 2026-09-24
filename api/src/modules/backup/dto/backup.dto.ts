import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class CreateBackupDto {
  @ApiPropertyOptional({ description: 'Optional name for the backup' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Optional description for the backup' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether to include database in backup', default: true })
  @IsOptional()
  @IsBoolean()
  includeDatabase?: boolean = true;

  @ApiPropertyOptional({ description: 'Whether to include files in backup', default: true })
  @IsOptional()
  @IsBoolean()
  includeFiles?: boolean = true;
}

export class UpdateBackupDto {
  @ApiPropertyOptional({ description: 'Updated name for the backup' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Updated description for the backup' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the backup is marked as favorite' })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}

export class BackupResponseDto {
  @ApiProperty({ description: 'Unique identifier for the backup' })
  id: string;

  @ApiProperty({ description: 'Backup name' })
  name: string;

  @ApiProperty({ description: 'Backup description' })
  description: string;

  @ApiProperty({ description: 'Filename of the backup file' })
  filename: string;

  @ApiProperty({ description: 'File path to the backup' })
  filePath: string;

  @ApiProperty({ description: 'File size in bytes' })
  fileSize: number;

  @ApiProperty({ description: 'Human readable file size' })
  fileSizeFormatted: string;

  @ApiProperty({ description: 'Timestamp when backup was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Whether database was included in backup' })
  includeDatabase: boolean;

  @ApiProperty({ description: 'Whether files were included in backup' })
  includeFiles: boolean;

  @ApiProperty({ description: 'Whether this backup is marked as favorite' })
  isFavorite: boolean;

  @ApiProperty({ description: 'Database version at backup time' })
  databaseVersion: string;

  @ApiProperty({ description: 'Status of the backup' })
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export class BackupListQueryDto {
  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order (asc/desc)', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter favorites only' })
  @IsOptional()
  @IsBoolean()
  favoritesOnly?: boolean;

  @ApiPropertyOptional({ description: 'Search by name or description' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class RestoreBackupDto {
  @ApiProperty({ description: 'ID of the backup to restore' })
  @IsString()
  backupId: string;

  @ApiPropertyOptional({ description: 'Whether to create a backup before restoring', default: true })
  @IsOptional()
  @IsBoolean()
  createBackupBeforeRestore?: boolean = true;

  @ApiPropertyOptional({ description: 'Optional name for the auto backup before restore' })
  @IsOptional()
  @IsString()
  autoBackupName?: string;
}
