#!/usr/bin/env node
// ================================================================
// generate-module.js — Auto-generate CRUD Module dari Prisma Model
// ================================================================
//
// CARA PENGGUNAAN:
//   node scripts/generate-module.js <ModelName>
//
// CONTOH:
//   node scripts/generate-module.js Brand
//   node scripts/generate-module.js Supplier
//   node scripts/generate-module.js Warehouse
//
// HASIL:
//   - src/modules/<model>/dto/<model>.dto.ts
//   - src/modules/<model>/<model>.service.ts
//   - src/modules/<model>/<model>.controller.ts
//   - src/modules/<model>/<model>.module.ts
//
// ENDPOINTS YANG DIBUAT:
//   GET    /<models>              → findAll (dengan OData query)
//   GET    /<models>/count        → getCount
//   GET    /<models>/:id          → findById
//   GET    /<models>/by/:field/:value → findByField
//   POST   /<models>              → create
//   POST   /<models>/bulk         → createBulk
//   PATCH  /<models>/:id          → patchById
//   PATCH  /<models>/by/:field/:value → patchByFilterReference
//   PATCH  /<models>/bulk         → patchBulk
//   DELETE /<models>/:id          → deleteById
//   DELETE /<models>/by/:field/:value → deleteByFilterReference
//   DELETE /<models>/bulk         → deleteBulk
//   PUT    /<models>              → upsert
//   PUT    /<models>/by/:field    → upsertByFilterReference
//   PUT    /<models>/bulk         → upsertBulk
//
// ================================================================

const fs = require('fs');
const path = require('path');
const { pascalCase, camelCase, kebabCase } = require('./utils-case');

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const MODULE_PATH = path.join(__dirname, '..', 'src', 'modules');

// Model-specific configurations
const MODEL_CONFIGS = {
  User: {
    primaryKeyType: 'string',
    softDelete: true,
    searchableFields: ['name', 'email'],
  },
  Category: {
    searchableFields: ['code', 'name', 'description'],
    allowedIncludes: ['products'],
  },
  Product: {
    searchableFields: ['code', 'barcode', 'name', 'description'],
    allowedIncludes: ['category', 'unit', 'brand', 'warehouse', 'productStocks'],
  },
  Supplier: {
    searchableFields: ['code', 'name', 'contactPerson'],
    allowedIncludes: ['purchases', 'purchaseOrders'],
  },
  Customer: {
    searchableFields: ['code', 'name', 'phone', 'email'],
    allowedIncludes: ['sales', 'customerDeposits'],
  },
  Warehouse: {
    searchableFields: ['code', 'name', 'address'],
    allowedIncludes: ['products', 'stockIns', 'stockOuts'],
  },
  Brand: {
    searchableFields: ['code', 'name'],
    allowedIncludes: ['products'],
  },
  Unit: {
    searchableFields: ['code', 'name'],
    allowedIncludes: ['products'],
  },
  Account: {
    searchableFields: ['code', 'name'],
    allowedIncludes: ['parent', 'children'],
  },
  CashIn: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['account'],
  },
  CashOut: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['account'],
  },
  CashTransfer: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['fromAccount', 'toAccount'],
  },
  CustomerDeposit: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['customer'],
  },
  SupplierDeposit: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['supplier'],
  },
  StockIn: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['warehouse', 'supplier'],
  },
  StockOut: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['warehouse'],
  },
  StockTransfer: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['fromWarehouse', 'toWarehouse'],
  },
  StockOpname: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['warehouse'],
  },
  Journal: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['journalEntries'],
  },
  JournalEntry: {
    searchableFields: [],
    allowedIncludes: ['journal', 'account'],
  },
  Sale: {
    searchableFields: ['code'],
    allowedIncludes: ['customer', 'saleItems'],
  },
  SaleItem: {
    searchableFields: [],
    allowedIncludes: ['sale', 'product'],
  },
  SalePayment: {
    searchableFields: ['referenceNumber'],
    allowedIncludes: ['sale'],
  },
  SaleReturn: {
    searchableFields: ['code'],
    allowedIncludes: ['sale', 'customer'],
  },
  Purchase: {
    searchableFields: ['code'],
    allowedIncludes: ['supplier', 'purchaseItems'],
  },
  PurchaseItem: {
    searchableFields: [],
    allowedIncludes: ['purchase', 'product'],
  },
  PurchasePayment: {
    searchableFields: ['referenceNumber'],
    allowedIncludes: ['purchase'],
  },
  PurchaseReturn: {
    searchableFields: ['code'],
    allowedIncludes: ['purchase', 'supplier'],
  },
  PurchaseOrder: {
    searchableFields: ['code'],
    allowedIncludes: ['supplier', 'purchaseOrderItems'],
  },
  PurchaseOrderItem: {
    searchableFields: [],
    allowedIncludes: ['purchaseOrder', 'product'],
  },
  ProductStock: {
    searchableFields: [],
    allowedIncludes: ['product', 'warehouse'],
  },
  SalesPerson: {
    searchableFields: ['code', 'name', 'phone'],
    allowedIncludes: ['sales'],
  },
  SalePoint: {
    searchableFields: ['code', 'name'],
    allowedIncludes: ['warehouse'],
  },
};

// Default config untuk model yang tidak ada di MODEL_CONFIGS
const DEFAULT_CONFIG = {
  primaryKeyType: 'number',
  softDelete: true,
  searchableFields: ['name'],
  allowedIncludes: [],
};

// ═══════════════════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════════════════

function generateDto(modelName) {
  return `import { IsString, IsOptional, IsBoolean, IsInt, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Create${modelName}Dto {
  @ApiProperty({ description: '${modelName} code' })
  @IsString()
  code: string;

  @ApiProperty({ description: '${modelName} name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true, description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class Update${modelName}Dto {
  @ApiPropertyOptional({ description: '${modelName} code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '${modelName} name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
`;
}

function generateService(modelName, config, fileName) {
  const searchableFields = config.searchableFields.map(f => `'${f}'`).join(', ');
  const allowedIncludes = config.allowedIncludes.map(i => `'${i}'`).join(', ');
  const softDelete = config.softDelete !== false;

  return `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { Create${modelName}Dto, Update${modelName}Dto } from './dto/${fileName}.dto';

@Injectable()
export class ${modelName}Service extends BaseService<
  any,
  Create${modelName}Dto,
  Update${modelName}Dto
> {
  constructor(
    prisma: PrismaService,
    redis: RedisService,
    queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: '${fileName}',
      primaryKey: 'id',
      searchableFields: [${searchableFields}],
      allowedIncludes: [${allowedIncludes}],
      allowedSortFields: ['id', 'code', 'name', 'createdAt'],
      allowedSelectFields: ['id', 'code', 'name', 'isActive'],
      defaultOrderBy: { id: 'asc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: ${softDelete},
      softDeleteField: 'isActive',
    });
  }
}
`;
}

function generateController(modelName, config, fileName) {
  const searchableFields = config.searchableFields.join(', ');
  const allowedIncludes = config.allowedIncludes.join(', ');

  return `import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { ${modelName}Service } from './${fileName}.service';
import { Create${modelName}Dto, Update${modelName}Dto } from './dto/${fileName}.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('${modelName}')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('${fileName}')
export class ${modelName}Controller extends BaseController<
  any,
  Create${modelName}Dto,
  Update${modelName}Dto
> {
  constructor(${camelCase(modelName)}Service: ${modelName}Service) {
    super(${camelCase(modelName)}Service, {
      modelName: '${modelName}',
      pluralName: '${modelName}s',
      primaryKeyType: '${config.primaryKeyType || 'number'}',
      paramId: 'id',
      routePrefix: '${fileName}',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all ${modelName}s with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: ${allowedIncludes}' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search: ${searchableFields}' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of ${modelName}s' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${modelName} by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get ${modelName} by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new ${modelName}' })
  async create(@Body() dto: Create${modelName}Dto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple ${modelName}s' })
  async createBulk(@Body() dtos: Create${modelName}Dto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update ${modelName} by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<Update${modelName}Dto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update ${modelName}s by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<Update${modelName}Dto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple ${modelName}s' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<Update${modelName}Dto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert ${modelName}' })
  async upsert(@Body() body: { where: { id: number }; create: Create${modelName}Dto; update: Partial<Update${modelName}Dto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert ${modelName} by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: Create${modelName}Dto; update: Partial<Update${modelName}Dto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert ${modelName}s' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete ${modelName} by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete ${modelName}s by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple ${modelName}s' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
`;
}

function generateModule(modelName, fileName) {
  return `import { Module } from '@nestjs/common';
import { ${modelName}Controller } from './${fileName}.controller';
import { ${modelName}Service } from './${fileName}.service';

@Module({
  controllers: [${modelName}Controller],
  providers: [${modelName}Service],
  exports: [${modelName}Service],
})
export class ${modelName}Module {}
`;
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Created file: ${filePath}`);
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

function main() {
  const modelName = process.argv[2];

  if (!modelName) {
    console.error('❌ Error: Model name is required');
    console.log('');
    console.log('Usage: node scripts/generate-module.js <ModelName>');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/generate-module.js Brand');
    console.log('  node scripts/generate-module.js Supplier');
    console.log('  node scripts/generate-module.js Warehouse');
    console.log('');
    console.log('Available model configurations:');
    Object.keys(MODEL_CONFIGS).forEach(name => {
      console.log(`  - ${name}`);
    });
    process.exit(1);
  }

  const config = MODEL_CONFIGS[modelName] || DEFAULT_CONFIG;
  const fileName = kebabCase(modelName); // e.g., CashIn -> cash-in
  const moduleDir = path.join(MODULE_PATH, fileName);
  const dtoDir = path.join(moduleDir, 'dto');

  console.log(`\n🚀 Generating ${modelName} module...\n`);

  // Create directories
  ensureDir(moduleDir);
  ensureDir(dtoDir);

  // Generate files with consistent kebab-case naming
  writeFile(path.join(dtoDir, `${fileName}.dto.ts`), generateDto(modelName));
  writeFile(path.join(moduleDir, `${fileName}.service.ts`), generateService(modelName, config, fileName));
  writeFile(path.join(moduleDir, `${fileName}.controller.ts`), generateController(modelName, config, fileName));
  writeFile(path.join(moduleDir, `${fileName}.module.ts`), generateModule(modelName, fileName));

  console.log('\n📝 Next steps:');
  console.log('1. Import the module in src/app-module.ts:');
  console.log(`   import { ${modelName}Module } from './modules/${fileName}/${fileName}.module';`);
  console.log('');
  console.log('2. Add to imports array:');
  console.log(`   ${modelName}Module,`);
  console.log('');
  console.log('3. Run the server to test:');
  console.log('   npm run start:dev');
  console.log('');
  console.log('📚 Available endpoints:');
  console.log(`   GET    /api/v1/${fileName}`);
  console.log(`   GET    /api/v1/${fileName}/count`);
  console.log(`   GET    /api/v1/${fileName}/:id`);
  console.log(`   GET    /api/v1/${fileName}/by/:field/:value`);
  console.log(`   POST   /api/v1/${fileName}`);
  console.log(`   POST   /api/v1/${fileName}/bulk`);
  console.log(`   PATCH  /api/v1/${fileName}/:id`);
  console.log(`   PATCH  /api/v1/${fileName}/by/:field/:value`);
  console.log(`   PATCH  /api/v1/${fileName}/bulk`);
  console.log(`   DELETE /api/v1/${fileName}/:id`);
  console.log(`   DELETE /api/v1/${fileName}/by/:field/:value`);
  console.log(`   DELETE /api/v1/${fileName}/bulk`);
  console.log(`   PUT    /api/v1/${fileName}`);
  console.log(`   PUT    /api/v1/${fileName}/by/:field`);
  console.log(`   PUT    /api/v1/${fileName}/bulk`);
  console.log('');
}

main();
