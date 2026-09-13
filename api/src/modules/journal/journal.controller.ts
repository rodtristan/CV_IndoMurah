import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JournalService } from './journal.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from './dto/journal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

interface JwtUser { id: string; }

@ApiTags('Journal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('journals')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  @ApiOperation({ summary: 'Get all journals' })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.journalService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journal by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.journalService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create journal entry' })
  async create(@Body() dto: CreateJournalEntryDto, @CurrentUser() user: JwtUser) {
    const data = await this.journalService.create(dto, user.id);
    return ApiResponse.ok(data, 'Journal Entry created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update journal entry' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateJournalEntryDto) {
    const data = await this.journalService.update(id, dto);
    return ApiResponse.ok(data, 'Journal Entry updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete journal entry' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.journalService.remove(id);
    return ApiResponse.ok(null, 'Journal Entry deleted');
  }
}
