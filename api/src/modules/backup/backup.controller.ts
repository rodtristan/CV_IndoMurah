import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import {
  CreateBackupDto,
  UpdateBackupDto,
  BackupResponseDto,
  BackupListQueryDto,
  RestoreBackupDto,
} from './dto/backup.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('Backup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('list')
  @ApiOperation({ summary: 'List all backups with optional filters and sorting' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by (default: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order: asc or desc (default: desc)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'favoritesOnly', required: false, description: 'Show only favorites' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or description' })
  @ApiResponse({ status: 200, description: 'List of backups', type: [BackupResponseDto] })
  async listBackups(@Query() query: BackupListQueryDto) {
    return this.backupService.listBackups({
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      status: query.status,
      favoritesOnly: query.favoritesOnly,
      search: query.search,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get backup statistics' })
  @ApiResponse({ status: 200, description: 'Backup statistics' })
  async getBackupStats() {
    return this.backupService.getBackupStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get backup details by ID' })
  @ApiParam({ name: 'id', description: 'Backup ID' })
  @ApiResponse({ status: 200, description: 'Backup details', type: BackupResponseDto })
  @ApiResponse({ status: 404, description: 'Backup not found' })
  async getBackupById(@Param('id') id: string) {
    return this.backupService.getBackupById(id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new backup' })
  @ApiResponse({ status: 201, description: 'Backup created successfully', type: BackupResponseDto })
  @ApiResponse({ status: 500, description: 'Backup creation failed' })
  @HttpCode(HttpStatus.CREATED)
  async createBackup(@Body() dto: CreateBackupDto) {
    return this.backupService.createBackup(dto);
  }

  @Post('restore/:id')
  @ApiOperation({ summary: 'Restore database from a backup' })
  @ApiParam({ name: 'id', description: 'Backup ID to restore from' })
  @ApiResponse({ status: 200, description: 'Backup restored successfully', type: BackupResponseDto })
  @ApiResponse({ status: 404, description: 'Backup not found' })
  @ApiResponse({ status: 400, description: 'Cannot restore incomplete backup' })
  @HttpCode(HttpStatus.OK)
  async restoreBackup(
    @Param('id') id: string,
    @Body() dto: RestoreBackupDto,
  ) {
    return this.backupService.restoreBackup(id, dto.createBackupBeforeRestore);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update backup metadata' })
  @ApiParam({ name: 'id', description: 'Backup ID' })
  @ApiResponse({ status: 200, description: 'Backup updated successfully', type: BackupResponseDto })
  @ApiResponse({ status: 404, description: 'Backup not found' })
  async updateBackup(
    @Param('id') id: string,
    @Body() dto: UpdateBackupDto,
  ) {
    return this.backupService.updateBackup(id, dto);
  }

  @Patch(':id/favorite')
  @ApiOperation({ summary: 'Toggle backup favorite status' })
  @ApiParam({ name: 'id', description: 'Backup ID' })
  @ApiResponse({ status: 200, description: 'Favorite toggled successfully', type: BackupResponseDto })
  @ApiResponse({ status: 404, description: 'Backup not found' })
  async toggleFavorite(@Param('id') id: string) {
    return this.backupService.toggleFavorite(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a backup' })
  @ApiParam({ name: 'id', description: 'Backup ID' })
  @ApiResponse({ status: 200, description: 'Backup deleted successfully' })
  @ApiResponse({ status: 404, description: 'Backup not found' })
  @HttpCode(HttpStatus.OK)
  async deleteBackup(@Param('id') id: string) {
    return this.backupService.deleteBackup(id);
  }
}
