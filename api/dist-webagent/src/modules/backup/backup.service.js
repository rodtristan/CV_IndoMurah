"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const archiver_1 = require("archiver");
const util_1 = require("util");
const stream_1 = require("stream");
const streamPipeline = (0, util_1.promisify)(stream_1.pipeline);
let BackupService = BackupService_1 = class BackupService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(BackupService_1.name);
        this.backupDir = path.resolve(process.cwd(), 'backups');
        this.metadataFile = path.join(this.backupDir, 'backup-metadata.json');
        this.ensureBackupDir();
    }
    ensureBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            this.logger.log(`Created backup directory: ${this.backupDir}`);
        }
    }
    getMetadata() {
        try {
            if (fs.existsSync(this.metadataFile)) {
                const data = fs.readFileSync(this.metadataFile, 'utf-8');
                return JSON.parse(data);
            }
        }
        catch (error) {
            this.logger.error('Error reading metadata file', error);
        }
        return [];
    }
    saveMetadata(metadata) {
        try {
            fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2), 'utf-8');
        }
        catch (error) {
            this.logger.error('Error saving metadata file', error);
            throw new common_1.InternalServerErrorException('Failed to save backup metadata');
        }
    }
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    generateBackupFilename() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `backup-${timestamp}.zip`;
    }
    async listBackups(options = {}) {
        let metadata = this.getMetadata();
        if (options.status) {
            metadata = metadata.filter((b) => b.status === options.status);
        }
        if (options.favoritesOnly) {
            metadata = metadata.filter((b) => b.isFavorite === true);
        }
        if (options.search) {
            const searchLower = options.search.toLowerCase();
            metadata = metadata.filter((b) => b.name.toLowerCase().includes(searchLower) ||
                b.description.toLowerCase().includes(searchLower));
        }
        const sortBy = options.sortBy || 'createdAt';
        const sortOrder = options.sortOrder || 'desc';
        metadata.sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
        });
        return metadata.map((b) => this.toResponseDto(b));
    }
    async createBackup(dto) {
        const id = this.generateBackupId();
        const filename = dto.name
            ? `backup-${dto.name.replace(/[^a-zA-Z0-9-_]/g, '-')}-${Date.now()}.zip`
            : this.generateBackupFilename();
        const metadata = {
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
        const allMetadata = this.getMetadata();
        allMetadata.push(metadata);
        this.saveMetadata(allMetadata);
        try {
            await this.createBackupArchive(metadata);
            const updatedMetadata = this.getMetadata();
            const backupIndex = updatedMetadata.findIndex((b) => b.id === id);
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
        }
        catch (error) {
            const allMetadata = this.getMetadata();
            const backupIndex = allMetadata.findIndex((b) => b.id === id);
            if (backupIndex !== -1) {
                allMetadata[backupIndex].status = 'failed';
                allMetadata[backupIndex].error = error.message;
                this.saveMetadata(allMetadata);
            }
            if (fs.existsSync(metadata.filePath)) {
                fs.unlinkSync(metadata.filePath);
            }
            this.logger.error(`Backup failed: ${error.message}`);
            throw new common_1.InternalServerErrorException(`Backup creation failed: ${error.message}`);
        }
    }
    async createBackupArchive(metadata) {
        const outputPath = metadata.filePath;
        const output = fs.createWriteStream(outputPath);
        const archive = new archiver_1.ZipArchive({ zlib: { level: 9 } });
        const archiveDone = new Promise((resolve, reject) => {
            archive.on('error', reject);
            archive.on('finish', () => resolve());
        });
        archive.pipe(output);
        if (metadata.includeDatabase) {
            try {
                const dbDump = await this.dumpDatabase();
                archive.append(dbDump, { name: 'database/dump.sql' });
                const schemaDump = await this.dumpDatabaseSchema();
                archive.append(schemaDump, { name: 'database/schema.sql' });
                const dbMetadata = {
                    dumpedAt: new Date().toISOString(),
                    databaseVersion: metadata.databaseVersion,
                    tables: await this.getTableList(),
                };
                archive.append(JSON.stringify(dbMetadata, null, 2), { name: 'database/metadata.json' });
            }
            catch (error) {
                this.logger.warn(`Database dump skipped: ${error.message}`);
                archive.append(`-- Database dump failed: ${error.message}`, { name: 'database/error.txt' });
            }
        }
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
        archive.finalize();
        await archiveDone;
    }
    async dumpDatabase() {
        const dbUrl = process.env.DATABASE_URL || this.buildDatabaseUrl();
        const tables = ['Account', 'Product', 'Category', 'Customer', 'Supplier',
            'Sale', 'Purchase', 'Journal', 'Inventory', 'Employee'];
        const dumpData = {};
        for (const table of tables) {
            try {
                const modelName = table.charAt(0).toLowerCase() + table.slice(1);
                if (this.prisma[modelName] && typeof this.prisma[modelName].findMany === 'function') {
                    const records = await this.prisma[modelName].findMany({
                        take: 10000,
                        skip: 0,
                    });
                    dumpData[modelName] = records;
                }
            }
            catch (error) {
                this.logger.debug(`Table ${table} not found or skipped`);
            }
        }
        return JSON.stringify(dumpData, null, 2);
    }
    async dumpDatabaseSchema() {
        return `-- Database Schema Export
-- Generated at: ${new Date().toISOString()}
-- Note: Use pg_dump -s for complete schema export
`;
    }
    async getDatabaseVersion() {
        try {
            const result = await this.prisma.$queryRaw `SELECT version()`;
            return result[0]?.version || 'Unknown';
        }
        catch {
            return 'PostgreSQL';
        }
    }
    async getTableList() {
        try {
            const result = await this.prisma.$queryRaw `
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `;
            return result.map(r => r.table_name);
        }
        catch {
            return [];
        }
    }
    buildDatabaseUrl() {
        const env = process.env.NODE_ENV || 'development';
        if (env === 'production') {
            const { DB_PRD_USER, DB_PRD_PASS, DB_PRD_HOST, DB_PRD_PORT, DB_PRD } = process.env;
            return `postgresql://${DB_PRD_USER}:${DB_PRD_PASS}@${DB_PRD_HOST}:${DB_PRD_PORT}/${DB_PRD}`;
        }
        const { DB_DEV_USER, DB_DEV_PASS, DB_DEV_HOST, DB_DEV_PORT, DB_DEV } = process.env;
        return `postgresql://${DB_DEV_USER}:${DB_DEV_PASS}@${DB_DEV_HOST}:${DB_DEV_PORT}/${DB_DEV}`;
    }
    async restoreBackup(_backupId, _createBackupBeforeRestore = true) {
        throw new common_1.NotImplementedException('Restore dari aplikasi tidak tersedia. Gunakan backup/restore Postgres terkelola (mis. Railway Backups atau pg_dump/pg_restore).');
    }
    async deleteBackup(backupId) {
        const metadata = this.getMetadata();
        const backupIndex = metadata.findIndex((b) => b.id === backupId);
        if (backupIndex === -1) {
            throw new common_1.NotFoundException(`Backup with ID ${backupId} not found`);
        }
        const backup = metadata[backupIndex];
        if (fs.existsSync(backup.filePath)) {
            fs.unlinkSync(backup.filePath);
        }
        metadata.splice(backupIndex, 1);
        this.saveMetadata(metadata);
        this.logger.log(`Backup deleted: ${backupId}`);
        return {
            success: true,
            message: `Backup "${backup.name}" deleted successfully`,
        };
    }
    async getBackupById(backupId) {
        const metadata = this.getMetadata();
        const backup = metadata.find((b) => b.id === backupId);
        if (!backup) {
            throw new common_1.NotFoundException(`Backup with ID ${backupId} not found`);
        }
        return this.toResponseDto(backup);
    }
    async updateBackup(backupId, dto) {
        const metadata = this.getMetadata();
        const backupIndex = metadata.findIndex((b) => b.id === backupId);
        if (backupIndex === -1) {
            throw new common_1.NotFoundException(`Backup with ID ${backupId} not found`);
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
    async toggleFavorite(backupId) {
        const metadata = this.getMetadata();
        const backup = metadata.find((b) => b.id === backupId);
        if (!backup) {
            throw new common_1.NotFoundException(`Backup with ID ${backupId} not found`);
        }
        backup.isFavorite = !backup.isFavorite;
        const backupIndex = metadata.findIndex((b) => b.id === backupId);
        metadata[backupIndex] = backup;
        this.saveMetadata(metadata);
        return this.toResponseDto(backup);
    }
    async getBackupStats() {
        const metadata = this.getMetadata();
        const totalSize = metadata.reduce((sum, b) => sum + (b.fileSize || 0), 0);
        const completedBackups = metadata.filter((b) => b.status === 'completed').length;
        const failedBackups = metadata.filter((b) => b.status === 'failed').length;
        const favoriteBackups = metadata.filter((b) => b.isFavorite).length;
        const sortedByDate = [...metadata].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
    generateBackupId() {
        return `bkp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    toResponseDto(backup) {
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
};
exports.BackupService = BackupService;
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BackupService);
