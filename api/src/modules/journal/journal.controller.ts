import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { JournalService } from './journal.service';
import { CreateJournalDto, UpdateJournalDto } from './dto/journal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

@ApiTags('Journal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('journal')
/** Manual journals: create/patch/delete by ID only (balanced, closed-year guarded; auto journals are read-only). */
export class JournalController extends BaseController<
  any,
  CreateJournalDto,
  UpdateJournalDto
> {
  constructor(private readonly journalService: JournalService) {
    super(journalService, {
      modelName: 'Journal',
      pluralName: 'Journals',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'journal',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all Journals with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: ' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search: name' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of Journals' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Journal by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get Journal by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new Journal' })
  async create(@Body() dto: CreateJournalDto, @CurrentUser() user?: any) {
    const data = await this.journalService.createJournal(dto, user.id);
    return { success: true, data, message: 'Journal created successfully' };
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update Journal by ID (pass `entries` to replace all debit/credit lines atomically)' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateJournalDto, @CurrentUser() user?: any) {
    const data = await this.journalService.updateJournal(Number(id), dto, user.id);
    return { success: true, data, message: 'Journal updated successfully' };
  }

  // PUT (UPSERT) endpoints
  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Journal by ID' })
  async deleteById(@Param('id') id: string) {
    const data = await this.journalService.deleteJournal(Number(id));
    return { success: true, data, message: 'Journal deleted successfully' };
  }

}
