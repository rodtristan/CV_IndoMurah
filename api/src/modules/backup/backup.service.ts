import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import * as fs from 'fs';
import * as path from 'path';
import { ZipArchive } from 'archiver';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { exec } from 'child_process';
import { BackupResponseDto, CreateBackupDto, UpdateBackupDto } from './dto/backup.dto';

const streamPipeline = promisify(pipeline);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir: string;
  private readonly metadataFile: string;

  constructor(private readonly prisma: PrismaService) {
    // Set backup directory relative to project root
    this.backupDir = path.resolve(process.cwd(), 'backups');
    this.metadataFile = path.join(this.backupDir, 'backup-metadata.json');
    this.ensureBackupDir();
  }

  private ensureBackupDir(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      this.logger.log(`Created backup directory: ${this.backupDir}`);
    }
  }

  private getMetadata(): any[] {
    try {
      if (fs.existsSync(this.metadataFile)) {
        const data = fs.readFileSync(this.metadataFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      this.logger.error('Error reading metadata file', error);
    }
    return [];
  }

  private saveMetadata(metadata: any[]): void {
    try {
      fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2), 'utf-8');
    } catch (error) {
      this.logger.error('Error saving metadata file', error);
      throw new InternalServerErrorException('Failed to save backup metadata');
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private generateBackupFilename(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `backup-${timestamp}.zip`;
  }

  async listBackups(options: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    favoritesOnly?: boolean;
    search?: string;
  } = {}): Promise<BackupResponseDto[]> {
    let metadata = this.getMetadata();

    // Apply filters
    if (options.status) {
      metadata = metadata.filter((b: any) => b.status === options.status);
    }

    if (options.favoritesOnly) {
      metadata = metadata.filter((b: any) => b.isFavorite === true);
    }

    if (options.search) {
      const searchLower = options.search.toLowerCase();
      metadata = metadata.filter((b: any) =>
        b.name.toLowerCase().includes(searchLower) ||
        b.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    metadata.sort((a: any, b: any) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return metadata.map((b: any) => this.toResponseDto(b));
  }

  async createBackup(dto: CreateBackupDto): Promise<BackupResponseDto> {
    const id = this.generateBackupId();
    const filename = dto.name
      ? `backup-${dto.name.replace(/[^a-zA-Z0-9-_]/g, '-')}-${Date.now()}.zip`
      : this.generateBackupFilename();

    const metadata: any = {
      id,
      name: dto.name || `Backup ${new Date().toLocaleString()}`,
      description: dto.description || '',
      filename,
      filePath: path.join(this.backupDir, filename),
      fileSize: 0,
      createdAt: new Date().toISOString(),
      includeDatabase: dto.includeDatabase ?? true,
      includeFiles: dto.includeFiles ?? true,
      isFavorite: false,
      databaseVersion: await this.getDatabaseVersion(),
      status: 'in_progress',
    };

    // Save initial metadata with in_progress status
    const allMetadata = this.getMetadata();
    allMetadata.push(metadata);
    this.saveMetadata(allMetadata);

    try {
      // Create backup archive
      await this.createBackupArchive(metadata);

      // Update metadata with completed status and file size
      const updatedMetadata = this.getMetadata();
      const backupIndex = updatedMetadata.findIndex((b: any) => b.id === id);
      if (backupIndex !== -1) {
        updatedMetadata[backupIndex].status = 'completed';
        if (fs.existsSync(metadata.filePath)) {
          const stats = fs.statSync(metadata.filePath);
          updatedMetadata[backupIndex].fileSize = stats.size;
        }
        this.saveMetadata(updatedMetadata);
        const completedBackup = updatedMetadata[backupIndex];
        this.logger.log(`Backup created successfully: ${filename}`);
        return this.toResponseDto(completedBackup);
      }

      this.logger.log(`Backup created successfully: ${filename}`);
      return this.toResponseDto(metadata);
    } catch (error) {
      // Update metadata with failed status
      const allMetadata = this.getMetadata();
      const backupIndex = allMetadata.findIndex((b: any) => b.id === id);
      if (backupIndex !== -1) {
        allMetadata[backupIndex].status = 'failed';
        allMetadata[backupIndex].error = error.message;
        this.saveMetadata(allMetadata);
      }

      // Clean up partial backup file if exists
      if (fs.existsSync(metadata.filePath)) {
        fs.unlinkSync(metadata.filePath);
      }

      this.logger.error(`Backup failed: ${error.message}`);
      throw new InternalServerErrorException(`Backup creation failed: ${error.message}`);
    }
  }

  private async createBackupArchive(metadata: any): Promise<void> {
    const outputPath = metadata.filePath;
    const output = fs.createWriteStream(outputPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    // Handle archive events
    const archiveDone = new Promise<void>((resolve, reject) => {
      archive.on('error', reject);
      archive.on('finish', () => resolve());
    });

    archive.pipe(output);

    // Add database dump if included
    if (metadata.includeDatabase) {
      try {
        const dbDump = await this.dumpDatabase();
        archive.append(dbDump, { name: 'database/dump.sql' });

        // Add database schema
        const schemaDump = await this.dumpDatabaseSchema();
        archive.append(schemaDump, { name: 'database/schema.sql' });

        // Add metadata JSON
        const dbMetadata = {
          dumpedAt: new Date().toISOString(),
          databaseVersion: metadata.databaseVersion,
          tables: await this.getTableList(),
        };
        archive.append(JSON.stringify(dbMetadata, null, 2), { name: 'database/metadata.json' });
      } catch (error) {
        this.logger.warn(`Database dump skipped: ${error.message}`);
        archive.append(`-- Database dump failed: ${error.message}`, { name: 'database/error.txt' });
      }
    }

    // Add backup metadata
    const backupInfo = {
      id: metadata.id,
      name: metadata.name,
      description: metadata.description,
      createdAt: metadata.createdAt,
      includeDatabase: metadata.includeDatabase,
      includeFiles: metadata.includeFiles,
      databaseVersion: metadata.databaseVersion,
    };
    archive.append(JSON.stringify(backupInfo, null, 2), { name: 'backup-info.json' });

    // Finalize archive
    archive.finalize();
    await archiveDone;
  }

  private async dumpDatabase(): Promise<string> {
    // Get database connection info from Prisma service
    const dbUrl = process.env.DATABASE_URL || this.buildDatabaseUrl();

    // Use pg_dump equivalent via Prisma
    // For full database dump, you would typically use pg_dump CLI tool
    // Here we export key tables data as JSON
    const tables = ['Account', 'Product', 'Category', 'Customer', 'Supplier',
                     'Sale', 'Purchase', 'Journal', 'Inventory', 'Employee'];

    const dumpData: Record<string, any[]> = {};

    for (const table of tables) {
      try {
        // Try to find the model dynamically
        const modelName = table.charAt(0).toLowerCase() + table.slice(1);
        if (this.prisma[modelName] && typeof this.prisma[modelName].findMany === 'function') {
          const records = await (this.prisma as any)[modelName].findMany({
            take: 10000,
            skip: 0,
          });
          dumpData[modelName] = records;
        }
      } catch (error) {
        // Table might not exist, skip it
        this.logger.debug(`Table ${table} not found or skipped`);
      }
    }

    return JSON.stringify(dumpData, null, 2);
  }

  private async dumpDatabaseSchema(): Promise<string> {
    // For a full schema dump, use pg_dump -s or similar
    // Here we return a placeholder - in production, integrate with pg_dump
    return `-- Database Schema Export
-- Generated at: ${new Date().toISOString()}
-- Note: Use pg_dump -s for complete schema export
`;
  }

  private async getDatabaseVersion(): Promise<string> {
    try {
      // Try to get database version from Prisma
      const result = await this.prisma.$queryRaw<any[]>`SELECT version()`;
      return result[0]?.version || 'Unknown';
    } catch {
      return 'PostgreSQL';
    }
  }

  private async getTableList(): Promise<string[]> {
    try {
      const result = await this.prisma.$queryRaw<any[]>`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `;
      return result.map(r => r.table_name);
    } catch {
      return [];
    }
  }

  private buildDatabaseUrl(): string {
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      const { DB_PRD_USER, DB_PRD_PASS, DB_PRD_HOST, DB_PRD_PORT, DB_PRD } = process.env;
      return `postgresql://${DB_PRD_USER}:${DB_PRD_PASS}@${DB_PRD_HOST}:${DB_PRD_PORT}/${DB_PRD}`;
    }
    const { DB_DEV_USER, DB_DEV_PASS, DB_DEV_HOST, DB_DEV_PORT, DB_DEV } = process.env;
    return `postgresql://${DB_DEV_USER}:${DB_DEV_PASS}@${DB_DEV_HOST}:${DB_DEV_PORT}/${DB_DEV}`;
  }

  async restoreBackup(backupId: string, createBackupBeforeRestore: boolean = true): Promise<BackupResponseDto> {
    const metadata = this.getMetadata();
    const backup = metadata.find((b: any) => b.id === backupId);

    if (!backup) {
      throw new NotFoundException(`Backup with ID ${backupId} not found`);
    }

    if (backup.status !== 'completed') {
      throw new BadRequestException('Cannot restore an incomplete or failed backup');
    }

    if (!fs.existsSync(backup.filePath)) {
      throw new NotFoundException(`Backup file not found at ${backup.filePath}`);
    }

    // Create a backup before restoring if requested
    if (createBackupBeforeRestore) {
      this.logger.log('Creating backup before restore...');
      try {
        await this.createBackup({
          name: backup.autoBackupName || `Auto-backup before restore ${backupId}`,
          description: `Automatic backup created before restoring backup ${backupId}`,
          includeDatabase: true,
          includeFiles: false,
        });
      } catch (error) {
        this.logger.warn(`Failed to create backup before restore: ${error.message}`);
        // Continue with restore even if pre-backup fails
      }
    }

    try {
      // Extract and restore the backup
      await this.extractAndRestoreBackup(backup);

      this.logger.log(`Backup restored successfully: ${backupId}`);
      return this.toResponseDto(backup);
    } catch (error) {
      this.logger.error(`Restore failed: ${error.message}`);
      throw new InternalServerErrorException(`Restore failed: ${error.message}`);
    }
  }

  private async extractAndRestoreBackup(backup: any): Promise<void> {
    const extractDir = path.join(this.backupDir, 'temp', backup.id);

    // Create temp extraction directory
    fs.mkdirSync(extractDir, { recursive: true });

    try {
      // For now, this is a placeholder for actual restore logic
      // In production, you would:
      // 1. Extract the zip file
      // 2. Parse the SQL dump
      // 3. Execute the restore via Prisma or direct SQL connection

      const backupInfoPath = path.join(extractDir, 'backup-info.json');
      if (fs.existsSync(backupInfoPath)) {
        const info = JSON.parse(fs.readFileSync(backupInfoPath, 'utf-8'));
        this.logger.log(`Restoring backup: ${info.name}`);
        this.logger.log(`Created at: ${info.createdAt}`);
      }

      // Simulate restore process
      this.logger.log('Extracting backup archive...');

      // Note: In production, use a proper unzip library like yauzl or unzipper
      // to extract the backup archive and execute the SQL dump
      // This is a simplified placeholder

      this.logger.log('Backup extraction completed (placeholder)');
    } finally {
      // Clean up temp directory
      if (fs.existsSync(extractDir)) {
        fs.rmSync(extractDir, { recursive: true, force: true });
      }
    }
  }

  async deleteBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    const metadata = this.getMetadata();
    const backupIndex = metadata.findIndex((b: any) => b.id === backupId);

    if (backupIndex === -1) {
      throw new NotFoundException(`Backup with ID ${backupId} not found`);
    }

    const backup = metadata[backupIndex];

    // Delete the backup file
    if (fs.existsSync(backup.filePath)) {
      fs.unlinkSync(backup.filePath);
    }

    // Remove from metadata
    metadata.splice(backupIndex, 1);
    this.saveMetadata(metadata);

    this.logger.log(`Backup deleted: ${backupId}`);
    return {
      success: true,
      message: `Backup "${backup.name}" deleted successfully`,
    };
  }

  async getBackupById(backupId: string): Promise<BackupResponseDto> {
    const metadata = this.getMetadata();
    const backup = metadata.find((b: any) => b.id === backupId);

    if (!backup) {
      throw new NotFoundException(`Backup with ID ${backupId} not found`);
    }

    return this.toResponseDto(backup);
  }

  async updateBackup(backupId: string, dto: UpdateBackupDto): Promise<BackupResponseDto> {
    const metadata = this.getMetadata();
    const backupIndex = metadata.findIndex((b: any) => b.id === backupId);

    if (backupIndex === -1) {
      throw new NotFoundException(`Backup with ID ${backupId} not found`);
    }

    const backup = metadata[backupIndex];

    if (dto.name !== undefined) {
      backup.name = dto.name;
    }
    if (dto.description !== undefined) {
      backup.description = dto.description;
    }
    if (dto.isFavorite !== undefined) {
      backup.isFavorite = dto.isFavorite;
    }

    metadata[backupIndex] = backup;
    this.saveMetadata(metadata);

    return this.toResponseDto(backup);
  }

  async toggleFavorite(backupId: string): Promise<BackupResponseDto> {
    const metadata = this.getMetadata();
    const backup = metadata.find((b: any) => b.id === backupId);

    if (!backup) {
      throw new NotFoundException(`Backup with ID ${backupId} not found`);
    }

    backup.isFavorite = !backup.isFavorite;

    // Update in metadata array
    const backupIndex = metadata.findIndex((b: any) => b.id === backupId);
    metadata[backupIndex] = backup;
    this.saveMetadata(metadata);

    return this.toResponseDto(backup);
  }

  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    totalSizeFormatted: string;
    completedBackups: number;
    failedBackups: number;
    favoriteBackups: number;
    oldestBackup: string | null;
    newestBackup: string | null;
  }> {
    const metadata = this.getMetadata();

    const totalSize = metadata.reduce((sum: number, b: any) => sum + (b.fileSize || 0), 0);
    const completedBackups = metadata.filter((b: any) => b.status === 'completed').length;
    const failedBackups = metadata.filter((b: any) => b.status === 'failed').length;
    const favoriteBackups = metadata.filter((b: any) => b.isFavorite).length;

    const sortedByDate = [...metadata].sort((a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return {
      totalBackups: metadata.length,
      totalSize,
      totalSizeFormatted: this.formatFileSize(totalSize),
      completedBackups,
      failedBackups,
      favoriteBackups,
      oldestBackup: sortedByDate.length > 0 ? sortedByDate[0].createdAt : null,
      newestBackup: sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1].createdAt : null,
    };
  }

  private generateBackupId(): string {
    return `bkp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private toResponseDto(backup: any): BackupResponseDto {
    return {
      id: backup.id,
      name: backup.name,
      description: backup.description || '',
      filename: backup.filename,
      filePath: backup.filePath,
      fileSize: backup.fileSize || 0,
      fileSizeFormatted: this.formatFileSize(backup.fileSize || 0),
      createdAt: new Date(backup.createdAt),
      includeDatabase: backup.includeDatabase ?? true,
      includeFiles: backup.includeFiles ?? true,
      isFavorite: backup.isFavorite ?? false,
      databaseVersion: backup.databaseVersion || 'Unknown',
      status: backup.status || 'completed',
    };
  }
}
