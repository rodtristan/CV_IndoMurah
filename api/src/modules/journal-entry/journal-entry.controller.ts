import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { JournalEntryService } from './journal-entry.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from './dto/journal-entry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('JournalEntry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('journal-entry')
/** Read-only: journal entries are written only through /journal (manual) and the automatic journals. */
export class JournalEntryController extends BaseController<
  any,
  CreateJournalEntryDto,
  UpdateJournalEntryDto
> {
  constructor(journalEntryService: JournalEntryService) {
    super(journalEntryService, {
      modelName: 'JournalEntry',
      pluralName: 'JournalEntrys',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'journal-entry',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all JournalEntrys with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: journal, account' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search: ' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of JournalEntrys' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get JournalEntry by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get JournalEntry by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  // PATCH endpoints
  // PUT (UPSERT) endpoints
  // DELETE endpoints
}
