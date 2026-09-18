import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeeController extends BaseController<
  any,
  CreateEmployeeDto,
  UpdateEmployeeDto
> {
  constructor(private readonly employeeService: EmployeeService) {
    super(employeeService, {
      modelName: 'Employee',
      pluralName: 'Employees',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'employees',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all Employees with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of Employees' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Employee by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get Employee by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new Employee' })
  async create(@Body() dto: CreateEmployeeDto) {
    const data = await this.employeeService.createEmployee(dto);
    return { success: true, data, message: 'Employee created successfully' };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple Employees' })
  async createBulk(@Body() dtos: CreateEmployeeDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update Employee by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateEmployeeDto>) {
    const data = await this.employeeService.updateEmployee(Number(id), dto);
    return { success: true, data, message: 'Employee updated successfully' };
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update Employees by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateEmployeeDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple Employees' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateEmployeeDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert Employee' })
  async upsert(@Body() body: { where: { id: number }; create: CreateEmployeeDto; update: Partial<UpdateEmployeeDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert Employee by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateEmployeeDto; update: Partial<UpdateEmployeeDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert Employees' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Employee by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete Employees by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple Employees' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
