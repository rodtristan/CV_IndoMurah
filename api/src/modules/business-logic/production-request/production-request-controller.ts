import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductionRequestService } from './production-request-service';
import { CreateProductionRequestDto, ProductionRequestFilterDto } from './production-request.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Business Logic - Production Request')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/production-request')
export class ProductionRequestController {
  constructor(private requestService: ProductionRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Create production request' })
  async createRequest(@Body() dto: CreateProductionRequestDto) {
    const userId = 'system';
    const data = await this.requestService.createRequest(dto, userId);
    return ApiResponse.ok(data, 'Request created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List production requests' })
  async listRequests(@Query() dto: ProductionRequestFilterDto) {
    const data = await this.requestService.listRequests(dto);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get request by ID' })
  async getRequest(@Param('id') id: number) {
    const data = await this.requestService.getRequest(id);
    return ApiResponse.ok(data);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve production request' })
  async approveRequest(@Param('id') id: number) {
    const userId = 'system';
    const data = await this.requestService.approveRequest(id, userId);
    return ApiResponse.ok(data, 'Request approved');
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject production request' })
  async rejectRequest(
    @Param('id') id: number,
    @Body('reason') reason?: string,
  ) {
    const userId = 'system';
    const data = await this.requestService.rejectRequest(id, userId, reason);
    return ApiResponse.ok(data, 'Request rejected');
  }
}
