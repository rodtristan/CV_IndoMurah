import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ServiceService } from './service-service';
import {
  CreateServiceDto,
  UpdateServiceStatusDto,
  AddServiceItemDto,
  CompleteServiceDto,
  ServiceFilterDto,
  RecordServicePaymentDto,
} from './service.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Service - Servis/Reparasi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/service')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // SERVICE ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create new service order (intake)' })
  async createService(@Body() dto: CreateServiceDto) {
    const userId = 'system';
    const data = await this.serviceService.createService(dto, userId);
    return ApiResponse.ok(data, 'Service order created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List service orders' })
  async listServices(@Query() dto: ServiceFilterDto) {
    const data = await this.serviceService.listServices(dto);
    return ApiResponse.ok(data);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get service statistics' })
  async getServiceStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.serviceService.getServiceStats(startDate, endDate);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  async getService(@Param('id') id: number) {
    const data = await this.serviceService.getService(id);
    return ApiResponse.ok(data);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update service status' })
  async updateServiceStatus(
    @Param('id') id: number,
    @Body() dto: UpdateServiceStatusDto,
  ) {
    const userId = 'system';
    const data = await this.serviceService.updateServiceStatus(id, dto, userId);
    return ApiResponse.ok(data, 'Service status updated');
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to service' })
  async addServiceItem(
    @Param('id') id: number,
    @Body() dto: AddServiceItemDto,
  ) {
    const userId = 'system';
    const data = await this.serviceService.addServiceItem(id, dto, userId);
    return ApiResponse.ok(data, 'Item added to service');
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete service' })
  async completeService(
    @Param('id') id: number,
    @Body() dto: CompleteServiceDto,
  ) {
    const userId = 'system';
    const data = await this.serviceService.completeService(id, dto, userId);
    return ApiResponse.ok(data, 'Service completed');
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Record service payment' })
  async recordPayment(
    @Param('id') id: number,
    @Body() dto: RecordServicePaymentDto,
  ) {
    const userId = 'system';
    const data = await this.serviceService.recordPayment(id, dto, userId);
    return ApiResponse.ok(data, 'Payment recorded');
  }
}
