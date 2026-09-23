import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QualityControlCategoryService } from './quality-control-category-service';
import {
  CreateQCCategoryDto,
  UpdateQCCategoryDto,
  CreateQCCheckpointDto,
  UpdateQCCheckpointDto,
  RecordQCCheckDto,
  QCCheckFilterDto,
} from './quality-control-category.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Quality Control - Quality Control')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/quality-control')
export class QualityControlCategoryController {
  constructor(private qualityControlService: QualityControlCategoryService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // QC CATEGORY ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('categories')
  @ApiOperation({ summary: 'Create QC category' })
  async createCategory(@Body() dto: CreateQCCategoryDto) {
    const data = await this.qualityControlService.createQCCategory(dto);
    return ApiResponse.ok(data, 'Category created successfully');
  }

  @Get('categories')
  @ApiOperation({ summary: 'List QC categories' })
  async listCategories(@Query('includeInactive') includeInactive?: string) {
    const data = await this.qualityControlService.listQCCategories(includeInactive === 'true');
    return ApiResponse.ok(data);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get QC category by ID' })
  async getCategory(@Param('id') id: number) {
    const data = await this.qualityControlService.getQCCategory(id);
    return ApiResponse.ok(data);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update QC category' })
  async updateCategory(@Param('id') id: number, @Body() dto: UpdateQCCategoryDto) {
    const data = await this.qualityControlService.updateQCCategory(id, dto);
    return ApiResponse.ok(data, 'Category updated successfully');
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete QC category' })
  async deleteCategory(@Param('id') id: number) {
    const data = await this.qualityControlService.deleteQCCategory(id);
    return ApiResponse.ok(data, 'Category deleted successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QC CHECKPOINT ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('checkpoints')
  @ApiOperation({ summary: 'Create QC checkpoint' })
  async createCheckpoint(@Body() dto: CreateQCCheckpointDto) {
    const data = await this.qualityControlService.createQCCheckpoint(dto);
    return ApiResponse.ok(data, 'Checkpoint created successfully');
  }

  @Patch('checkpoints/:id')
  @ApiOperation({ summary: 'Update QC checkpoint' })
  async updateCheckpoint(@Param('id') id: number, @Body() dto: UpdateQCCheckpointDto) {
    const data = await this.qualityControlService.updateQCCheckpoint(id, dto);
    return ApiResponse.ok(data, 'Checkpoint updated successfully');
  }

  @Delete('checkpoints/:id')
  @ApiOperation({ summary: 'Delete QC checkpoint' })
  async deleteCheckpoint(@Param('id') id: number) {
    const data = await this.qualityControlService.deleteQCCheckpoint(id);
    return ApiResponse.ok(data, 'Checkpoint deleted successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QC CHECK ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('checks')
  @ApiOperation({ summary: 'Record QC check' })
  async recordCheck(@Body() dto: RecordQCCheckDto) {
    const userId = 'system';
    const data = await this.qualityControlService.recordQCCheck(dto, userId);
    return ApiResponse.ok(data, 'QC check recorded successfully');
  }

  @Get('checks')
  @ApiOperation({ summary: 'List QC checks' })
  async listChecks(@Query() dto: QCCheckFilterDto) {
    const data = await this.qualityControlService.listQCChecks(dto);
    return ApiResponse.ok(data);
  }
}
