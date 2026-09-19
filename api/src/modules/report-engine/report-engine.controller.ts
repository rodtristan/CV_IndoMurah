import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { ReportEngineService } from './report-engine.service';

// NOTE: static routes (catalog, templates) are declared before the parametrised ones.
@ApiTags('Report Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('report-engine')
export class ReportEngineController {
  constructor(private readonly service: ReportEngineService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'List available reports with their params and fields' })
  catalog() {
    return ApiResponse.ok(this.service.catalog());
  }

  @Get('templates/:key')
  @ApiOperation({ summary: 'List print templates of a report' })
  async listTemplates(@Param('key') key: string, @CurrentUser() user: any) {
    return ApiResponse.ok(await this.service.listTemplates(key, user));
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create a print template' })
  async createTemplate(@Body() body: any, @CurrentUser() user: any) {
    return ApiResponse.ok(await this.service.createTemplate(body, user), 'Template berhasil disimpan');
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update a print template' })
  async updateTemplate(@Param('id', ParseIntPipe) id: number, @Body() body: any, @CurrentUser() user: any) {
    return ApiResponse.ok(await this.service.updateTemplate(id, body, user), 'Template berhasil diperbarui');
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete a print template' })
  async deleteTemplate(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    await this.service.deleteTemplate(id, user);
    return ApiResponse.ok(null, 'Template berhasil dihapus');
  }

  @Post('data/:key')
  @HttpCode(200)
  @ApiOperation({ summary: 'Run a report and return its rows plus print header info' })
  async data(@Param('key') key: string, @Body() body: any, @CurrentUser() user: any) {
    return ApiResponse.ok(await this.service.getData(key, body ?? {}, user));
  }
}
