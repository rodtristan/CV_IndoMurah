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
//
// ================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { pascalCase, camelCase, kebabCase, snakeCase } = require('./utils-case');

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const MODULE_PATH = path.join(__dirname, '..', 'src', 'modules');
const APP_MODULE_PATH = path.join(__dirname, '..', 'src', 'app-module.ts');
const PRISMA_SCHEMA_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma');

// Model-specific configurations
const MODEL_CONFIGS = {
  User: {
    primaryKeyType: 'string',
    softDelete: true,
    searchableFields: ['name', 'email'],
    allowedIncludes: [],
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
    allowedIncludes: ['purchases', 'purchaseOrders', 'stockIns', 'supplierDeposits', 'purchaseReturns'],
  },
  Customer: {
    searchableFields: ['code', 'name', 'phone', 'email'],
    allowedIncludes: ['sales', 'customerDeposits', 'pointRedemptions', 'saleReturns'],
  },
  Warehouse: {
    searchableFields: ['code', 'name', 'address'],
    allowedIncludes: ['products', 'stockIns', 'stockOuts', 'stockTransfersFrom', 'stockTransfersTo', 'stockOpnames', 'sales', 'purchases', 'purchaseOrders', 'saleReturns', 'purchaseReturns', 'salePoints'],
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
    allowedIncludes: ['parent', 'children', 'cashIns', 'cashOuts', 'cashTransfersFrom', 'cashTransfersTo', 'journalEntries'],
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
    allowedIncludes: ['warehouse', 'supplier', 'stockInItems'],
  },
  StockInItem: {
    searchableFields: [],
    allowedIncludes: ['stockIn', 'product', 'unit'],
  },
  StockOut: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['warehouse', 'stockOutItems'],
  },
  StockOutItem: {
    searchableFields: [],
    allowedIncludes: ['stockOut', 'product', 'unit'],
  },
  StockTransfer: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['fromWarehouse', 'toWarehouse', 'transferItems'],
  },
  StockTransferItem: {
    searchableFields: [],
    allowedIncludes: ['stockTransfer', 'product', 'unit'],
  },
  StockOpname: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['warehouse', 'opnameItems'],
  },
  StockOpnameItem: {
    searchableFields: [],
    allowedIncludes: ['stockOpname', 'product', 'unit'],
  },
  Journal: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['journalEntries'],
  },
  JournalEntry: {
    searchableFields: [],
    allowedIncludes: ['journal', 'account', 'user'],
  },
  Sale: {
    searchableFields: ['code'],
    allowedIncludes: ['customer', 'salesPerson', 'salePoint', 'warehouse', 'creator', 'saleItems', 'salePayments', 'saleReturns'],
  },
  SaleItem: {
    searchableFields: [],
    allowedIncludes: ['sale', 'product', 'unit'],
  },
  SalePayment: {
    searchableFields: ['referenceNumber'],
    allowedIncludes: ['sale', 'creator'],
  },
  SaleReturn: {
    searchableFields: ['code'],
    allowedIncludes: ['sale', 'customer', 'warehouse', 'creator', 'returnItems'],
  },
  SaleReturnItem: {
    searchableFields: [],
    allowedIncludes: ['saleReturn', 'product', 'unit'],
  },
  SalePoint: {
    searchableFields: ['code', 'name'],
    allowedIncludes: ['warehouse', 'sales'],
  },
  SalesPerson: {
    searchableFields: ['code', 'name', 'phone'],
    allowedIncludes: ['sales'],
  },
  Purchase: {
    searchableFields: ['code'],
    allowedIncludes: ['supplier', 'warehouse', 'creator', 'purchaseItems', 'purchasePayments', 'purchaseReturns'],
  },
  PurchaseItem: {
    searchableFields: [],
    allowedIncludes: ['purchase', 'product', 'unit'],
  },
  PurchasePayment: {
    searchableFields: ['referenceNumber'],
    allowedIncludes: ['purchase', 'creator'],
  },
  PurchaseReturn: {
    searchableFields: ['code'],
    allowedIncludes: ['purchase', 'supplier', 'warehouse', 'creator', 'returnItems'],
  },
  PurchaseReturnItem: {
    searchableFields: [],
    allowedIncludes: ['purchaseReturn', 'product', 'unit'],
  },
  PurchaseOrder: {
    searchableFields: ['code'],
    allowedIncludes: ['supplier', 'warehouse', 'creator', 'purchaseOrderItems'],
  },
  PurchaseOrderItem: {
    searchableFields: [],
    allowedIncludes: ['purchaseOrder', 'product', 'unit'],
  },
  ProductStock: {
    searchableFields: [],
    allowedIncludes: ['product', 'warehouse'],
  },
  Role: {
    searchableFields: ['roleName'],
    allowedIncludes: ['userRoles', 'roleMenus'],
  },
  Menu: {
    searchableFields: ['menuName', 'route'],
    allowedIncludes: ['parentMenu', 'childMenus', 'userMenus', 'roleMenus'],
  },
  UserRole: {
    searchableFields: [],
    allowedIncludes: ['user', 'role'],
  },
  UserMenu: {
    searchableFields: [],
    allowedIncludes: ['user', 'menu'],
  },
  RoleMenu: {
    searchableFields: [],
    allowedIncludes: ['role', 'menu'],
  },
  Log: {
    searchableFields: ['endpoint', 'message'],
    allowedIncludes: [],
  },
  PointSetting: {
    searchableFields: ['name'],
    allowedIncludes: [],
  },
  PointRedemption: {
    searchableFields: ['code', 'rewardName'],
    allowedIncludes: ['customer', 'creator'],
  },
  Company: {
    searchableFields: ['name'],
    allowedIncludes: [],
  },
  Numbering: {
    searchableFields: ['type'],
    allowedIncludes: [],
  },
  ExpenseCategory: {
    searchableFields: ['code', 'name'],
    allowedIncludes: ['expenses'],
  },
  Expense: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['expenseCategory', 'approver'],
  },
  Transfer: {
    searchableFields: ['code', 'description'],
    allowedIncludes: ['fromAccount', 'toAccount', 'fromWarehouse', 'toWarehouse'],
  },
  // ─── Asset Management ───
  AssetCategory: {
    primaryKeyType: 'number',
    searchableFields: ['code', 'name'],
    allowedIncludes: ['assets'],
    pluralName: 'Asset Categories',
    routeName: 'asset-categories',
  },
  Asset: {
    primaryKeyType: 'number',
    searchableFields: ['code', 'name', 'location'],
    allowedIncludes: ['category'],
    pluralName: 'Assets',
    routeName: 'assets',
  },
  // ─── Service & Repair ───
  Service: {
    primaryKeyType: 'number',
    searchableFields: ['code', 'customerName', 'productName'],
    allowedIncludes: ['customer', 'items'],
    pluralName: 'Services',
    routeName: 'services',
  },
  ServiceItem: {
    primaryKeyType: 'number',
    searchableFields: ['productName'],
    allowedIncludes: ['service', 'product'],
    pluralName: 'Service Items',
    routeName: 'service-items',
  },
  // ─── Price History ───
  PriceHistory: {
    primaryKeyType: 'number',
    searchableFields: [],
    allowedIncludes: ['product'],
    pluralName: 'Price Histories',
    routeName: 'price-histories',
  },
  // ─── Voucher ───
  Voucher: {
    primaryKeyType: 'number',
    searchableFields: ['code', 'name'],
    allowedIncludes: [],
    pluralName: 'Vouchers',
    routeName: 'vouchers',
  },
  // ─── Tax ───
  Tax: {
    primaryKeyType: 'number',
    searchableFields: ['code', 'name'],
    allowedIncludes: [],
    pluralName: 'Taxes',
    routeName: 'taxes',
  },
  // ─── Production ───
  Production: {
    primaryKeyType: 'number',
    searchableFields: ['code', 'productName'],
    allowedIncludes: ['warehouse', 'product', 'items'],
    pluralName: 'Productions',
    routeName: 'productions',
  },
  ProductionItem: {
    primaryKeyType: 'number',
    searchableFields: ['productName'],
    allowedIncludes: ['production', 'product', 'unit'],
    pluralName: 'Production Items',
    routeName: 'production-items',
  },
  // ─── HRM ───
  Department: {
    primaryKeyType: 'number',
    searchableFields: ['code', 'name'],
    allowedIncludes: ['employees'],
    pluralName: 'Departments',
    routeName: 'departments',
  },
  Position: {
    primaryKeyType: 'number',
    searchableFields: ['code', 'name'],
    allowedIncludes: ['employees'],
    pluralName: 'Positions',
    routeName: 'positions',
  },
  Employee: {
    primaryKeyType: 'number',
    searchableFields: ['code', 'name', 'phone'],
    allowedIncludes: ['department', 'position', 'attendances', 'payrolls', 'loans'],
    pluralName: 'Employees',
    routeName: 'employees',
  },
  Attendance: {
    primaryKeyType: 'number',
    searchableFields: [],
    allowedIncludes: ['employee'],
    pluralName: 'Attendances',
    routeName: 'attendances',
  },
  Payroll: {
    primaryKeyType: 'number',
    searchableFields: ['code', 'period'],
    allowedIncludes: ['employee'],
    pluralName: 'Payrolls',
    routeName: 'payrolls',
  },
  Loan: {
    primaryKeyType: 'number',
    searchableFields: ['code', 'loanType'],
    allowedIncludes: ['employee', 'installments'],
    pluralName: 'Loans',
    routeName: 'loans',
  },
  LoanInstallment: {
    primaryKeyType: 'number',
    searchableFields: ['period'],
    allowedIncludes: ['loan'],
    pluralName: 'Loan Installments',
    routeName: 'loan-installments',
  },
  // ─── Notification ───
  Notification: {
    primaryKeyType: 'number',
    searchableFields: ['title', 'message'],
    allowedIncludes: ['user'],
    pluralName: 'Notifications',
    routeName: 'notifications',
  },
  // ─── Shelf (Rak) ───
  Shelf: {
    primaryKeyType: 'number',
    searchableFields: ['code', 'name'],
    allowedIncludes: ['warehouse', 'shelfProducts'],
    pluralName: 'Shelves',
    routeName: 'shelves',
  },
  // ─── Shelf Product ───
  ShelfProduct: {
    primaryKeyType: 'number',
    searchableFields: [],
    allowedIncludes: ['shelf', 'product'],
    pluralName: 'Shelf Products',
    routeName: 'shelf-products',
  },
  // ─── Product Group (Golongan Produk) ───
  ProductGroup: {
    primaryKeyType: 'number',
    searchableFields: ['code', 'name'],
    allowedIncludes: ['products'],
    pluralName: 'Product Groups',
    routeName: 'product-groups',
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
// PRISMA SCHEMA PARSER
// ═══════════════════════════════════════════════════════════════════

/**
 * Parse Prisma schema dan extract model fields
 */
function parsePrismaSchema(schemaPath, modelName) {
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Find model block
  const modelRegex = new RegExp(`model\\s+${modelName}\\s*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}`, 's');
  const modelMatch = schema.match(modelRegex);

  if (!modelMatch) {
    return null;
  }

  const modelBlock = modelMatch[1];
  const fields = [];

  // Parse fields
  const fieldLines = modelBlock.split('\n');
  let currentBlock = '';
  let blockDepth = 0;

  for (const line of fieldLines) {
    const trimmed = line.trim();

    // Track block depth for relations
    blockDepth += (trimmed.match(/\\{/g) || []).length;
    blockDepth -= (trimmed.match(/\\}/g) || []).length;

    if (blockDepth > 0) {
      currentBlock += line + '\n';
      if (blockDepth === 0) {
        fields.push({ raw: currentBlock.trim(), isRelation: true });
        currentBlock = '';
      }
    } else if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('@@')) {
      if (currentBlock) {
        fields.push({ raw: currentBlock.trim(), isRelation: true });
        currentBlock = '';
      }
      fields.push({ raw: trimmed, isRelation: false });
    }
  }

  return fields;
}

/**
 * Parse satu field dari Prisma
 */
function parseField(raw) {
  const parts = raw.split(/\s+/);
  if (parts.length < 2) return null;

  const name = parts[0];
  let type = parts[1];
  const modifiers = parts.slice(2);

  // Skip relation fields
  if (type.includes('[') || name === 'id') return null;

  // Handle optional/array types
  const isOptional = type.includes('?');
  const isArray = type.includes('[]');
  type = type.replace(/[\?\[\]]/g, '');

  // Handle special types
  let isDecimal = false;
  if (type === 'Decimal') {
    isDecimal = true;
    type = 'number';
  } else if (type === 'DateTime') {
    type = 'Date';
  } else if (type === 'Json') {
    type = 'any';
  }

  return {
    name,
    type,
    isOptional,
    isArray,
    isDecimal,
    raw,
  };
}

/**
 * Get TypeScript type dari Prisma type
 */
function getTsType(field) {
  switch (field.type) {
    case 'String':
      return 'string';
    case 'Boolean':
      return 'boolean';
    case 'Int':
    case 'Float':
    case 'Decimal':
    case 'number':
      return 'number';
    case 'DateTime':
    case 'Date':
      return 'Date';
    case 'Json':
      return 'any';
    default:
      return 'any';
  }
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE GENERATORS
// ═══════════════════════════════════════════════════════════════════

function generateDto(modelName, fields, config) {
  const createFields = [];
  const updateFields = [];
  const responseFields = [];

  for (const field of fields) {
    if (!field) continue;

    // Skip certain fields
    if (['id', 'createdAt', 'updatedAt'].includes(field.name)) continue;

    const tsType = getTsType(field);
    const isOptional = field.isOptional || ['createdAt', 'updatedAt'].includes(field.name);

    // Create DTO field
    const createField = {
      name: field.name,
      type: tsType,
      isOptional: false,
      isDecimal: field.isDecimal,
      decorator: `@ApiProperty({ description: '${field.name}' })`,
    };

    // Update DTO field (all optional)
    const updateField = {
      name: field.name,
      type: tsType,
      isOptional: true,
      isDecimal: field.isDecimal,
      decorator: `@ApiPropertyOptional({ description: '${field.name}' })`,
    };

    createFields.push(createField);
    updateFields.push(updateField);
    responseFields.push({ name: field.name, type: tsType, decorator: `@ApiProperty({ description: '${field.name}' })` });
  }

  // Generate Create DTO
  let createDto = `import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Create${modelName}Dto {
`;

  for (const field of createFields) {
    if (field.isOptional && field.name !== 'code') {
      createDto += `  @ApiPropertyOptional({ description: '${field.name}' })\n`;
      createDto += `  @IsOptional()\n`;
    } else {
      createDto += `  @ApiProperty({ description: '${field.name}' })\n`;
    }

    if (field.type === 'string') {
      createDto += `  @IsString()\n`;
    } else if (field.type === 'number') {
      createDto += `  @IsNumber()\n`;
    } else if (field.type === 'boolean') {
      createDto += `  @IsBoolean()\n`;
    }

    createDto += `  ${field.name}${field.isOptional && field.name !== 'code' ? '?' : ''}: ${field.type};\n\n`;
  }

  createDto += `}

export class Update${modelName}Dto {
`;

  for (const field of updateFields) {
    createDto += `  @ApiPropertyOptional({ description: '${field.name}' })\n`;
    createDto += `  @IsOptional()\n`;

    if (field.type === 'string') {
      createDto += `  @IsString()\n`;
    } else if (field.type === 'number') {
      createDto += `  @IsNumber()\n`;
    } else if (field.type === 'boolean') {
      createDto += `  @IsBoolean()\n`;
    }

    createDto += `  ${field.name}?: ${field.type};\n\n`;
  }

  createDto += `}

export class ${modelName}ResponseDto {
`;

  for (const field of responseFields) {
    createDto += `  @ApiProperty({ description: '${field.name}' })\n`;
    createDto += `  ${field.name}: ${field.type};\n\n`;
  }

  createDto += `}

export class Query${modelName}Dto {
  @ApiPropertyOptional({ description: 'Fields to select' })
  @IsOptional()
  @IsString()
  $select?: string;

  @ApiPropertyOptional({ description: 'Relations to include' })
  @IsOptional()
  @IsString()
  $include?: string;

  @ApiPropertyOptional({ description: 'Number of records to skip' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  $skip?: number;

  @ApiPropertyOptional({ description: 'Number of records to take' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  $take?: number;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  $search?: string;
}
`;

  return createDto;
}

function generateService(modelName, config, fileName, fields = []) {
  // BUG (found & fixed 2026-09-17): this used to hardcode `softDelete: true` +
  // `softDeleteField: 'isActive'` regardless of whether the model actually has
  // an `isActive` column, and used the kebab-case `fileName` as `modelName`
  // instead of the camelCase Prisma Client accessor — both caused every
  // generated module's findAll/findById/etc. to throw or silently 500 at
  // runtime. See modules like product-stock, activity-log, sale-item, etc.
  // (fixed by hand across ~29 already-generated modules that hit this).
  const hasIsActive = fields.some((f) => f.name === 'isActive');
  const softDelete = config.softDelete !== false && hasIsActive;
  const modelAccessor = camelCase(modelName);

  return `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { Create${modelName}Dto, Update${modelName}Dto } from './dto/${fileName}.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ${modelName}Service extends BaseService<
  any,
  Create${modelName}Dto,
  Update${modelName}Dto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: '${modelAccessor}',
      primaryKey: 'id',
      // Use '*' to allow all fields (searchable, sortable, selectable, includable)
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { createdAt: 'desc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: ${softDelete},${softDelete ? "\n      softDeleteField: 'isActive'," : ''}
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC METHODS
  // ═══════════════════════════════════════════════════════════════════
  // Tambahkan method bisnis logic di sini
  // Contoh:
  //
  // async processTransaction(data: Create${modelName}Dto, userId: string) {
  //   return this.prisma.$transaction(async (tx) => {
  //     // 1. Create record
  //     const result = await tx.${modelName}.create({ data });
  //
  //     // 2. Update related records
  //     // await tx.relatedModel.update(...);
  //
  //     // 3. Invalidate cache
  //     await this.redis.del('cache:${fileName}:*');
  //
  //     return result;
  //   });
  // }
  // ═══════════════════════════════════════════════════════════════════
}
`;
}

function generateController(modelName, config, fileName) {
  const primaryKeyType = config.primaryKeyType || 'number';
  const pluralName = config.pluralName || modelName + 's';
  const routeName = config.routeName || fileName;

  return `import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { ${modelName}Service } from './${fileName}.service';
import { Create${modelName}Dto, Update${modelName}Dto } from './dto/${fileName}.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('${pluralName}')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('${routeName}')
export class ${modelName}Controller extends BaseController<
  any,
  Create${modelName}Dto,
  Update${modelName}Dto
> {
  constructor(${camelCase(modelName)}Service: ${modelName}Service) {
    super(${camelCase(modelName)}Service, {
      modelName: '${modelName}',
      pluralName: '${pluralName}',
      primaryKeyType: '${primaryKeyType}',
      paramId: 'id',
      routePrefix: '${routeName}',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all ${pluralName} with OData query support' })
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
  @ApiOperation({ summary: 'Get count of ${pluralName}' })
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
  @ApiOperation({ summary: 'Create multiple ${pluralName}' })
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
  @ApiOperation({ summary: 'Update ${pluralName} by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<Update${modelName}Dto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple ${pluralName}' })
  async patchBulk(@Body() body: { ids: ${primaryKeyType === 'string' ? 'string[]' : 'number[]' }; data: Partial<Update${modelName}Dto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert ${modelName}' })
  async upsert(@Body() body: { where: { id: ${primaryKeyType === 'string' ? 'string' : 'number'} }; create: Create${modelName}Dto; update: Partial<Update${modelName}Dto> }) {
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
  @ApiOperation({ summary: 'Bulk upsert ${pluralName}' })
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
  @ApiOperation({ summary: 'Delete ${pluralName} by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple ${pluralName}' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
`;
}

function generateModule(modelName, fileName) {
  return `import { Module } from '@nestjs/common';
import { ${modelName}Controller } from './${fileName}.controller';
import { ${modelName}Service } from './${fileName}.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [${modelName}Controller],
  providers: [${modelName}Service],
  exports: [${modelName}Service],
})
export class ${modelName}Module {}
`;
}

// ═══════════════════════════════════════════════════════════════════
// APP-MODULE UPDATER
// ═══════════════════════════════════════════════════════════════════

function updateAppModule(modelName, fileName) {
  const newImport = `import { ${modelName}Module } from './modules/${fileName}/${fileName}.module';`;
  const moduleEntry = `${modelName}Module,`;

  let content = fs.readFileSync(APP_MODULE_PATH, 'utf8');

  // Check if import already exists
  if (content.includes(newImport)) {
    console.log(`⚠️  Module import already exists in app-module.ts`);
    return false;
  }

  // Check if module already in imports
  if (content.includes(moduleEntry)) {
    console.log(`⚠️  Module already imported in app-module.ts`);
    return false;
  }

  const lines = content.split('\n');

  // Find the last import line (not from @nestjs or @prisma)
  let lastImportLine = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.startsWith('import ') && line.includes("from './modules/")) {
      lastImportLine = i;
      break;
    }
  }

  if (lastImportLine === -1) {
    console.log(`⚠️  Could not find module import location in app-module.ts`);
    return false;
  }

  // Insert the new import after the last module import
  lines.splice(lastImportLine + 1, 0, newImport);

  // Now find the last Module, entry in the imports array
  let lastModuleLine = -1;
  let inImportsArray = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('imports: [')) {
      inImportsArray = true;
      continue;
    }

    if (inImportsArray) {
      if (line.trim() === '],' || line.trim() === ']') {
        break;
      }
      // Track lines containing Module, (with or without comments)
      if (line.includes('Module,') && !line.trim().startsWith('//')) {
        lastModuleLine = i;
      }
    }
  }

  if (lastModuleLine === -1) {
    console.log(`⚠️  Could not find module entry point in imports array`);
    return false;
  }

  // Insert module entry after the last module
  lines.splice(lastModuleLine + 1, 0, `    ${moduleEntry}`);

  fs.writeFileSync(APP_MODULE_PATH, lines.join('\n'), 'utf8');
  console.log(`✅ Updated app-module.ts with ${modelName}Module`);

  return true;
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
    return true;
  }
  return false;
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
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

  // Validation
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
  const fileName = kebabCase(modelName);
  const moduleDir = path.join(MODULE_PATH, fileName);
  const dtoDir = path.join(moduleDir, 'dto');

  console.log(`\n🚀 Generating ${modelName} module...\n`);

  // ═══════════════════════════════════════════════════════════════════
  // CHECK IF MODULE ALREADY EXISTS
  // ═══════════════════════════════════════════════════════════════════

  if (fs.existsSync(moduleDir)) {
    console.error(`❌ Error: Module "${fileName}" already exists at ${moduleDir}`);
    console.log('');
    console.log('Existing files:');
    const files = fs.readdirSync(moduleDir, { recursive: true });
    files.forEach(f => console.log(`  - ${f}`));
    console.log('');
    console.log('To regenerate, please delete the folder first:');
    console.log(`  rm -rf ${moduleDir}`);
    process.exit(1);
  }

  // ═══════════════════════════════════════════════════════════════════
  // PARSE PRISMA SCHEMA
  // ═══════════════════════════════════════════════════════════════════

  console.log('📖 Parsing Prisma schema...');
  const rawFields = parsePrismaSchema(PRISMA_SCHEMA_PATH, modelName);

  if (!rawFields) {
    console.error(`❌ Error: Model "${modelName}" not found in Prisma schema`);
    console.log(`   Check ${PRISMA_SCHEMA_PATH}`);
    process.exit(1);
  }

  const fields = rawFields
    .map(raw => parseField(raw.raw))
    .filter(f => f !== null);

  console.log(`   Found ${fields.length} fields`);

  // ═══════════════════════════════════════════════════════════════════
  // CREATE DIRECTORIES
  // ═══════════════════════════════════════════════════════════════════

  ensureDir(moduleDir);
  ensureDir(dtoDir);

  // ═══════════════════════════════════════════════════════════════════
  // GENERATE FILES
  // ═══════════════════════════════════════════════════════════════════

  console.log('\n📝 Generating files...');

  // 1. DTO
  writeFile(
    path.join(dtoDir, `${fileName}.dto.ts`),
    generateDto(modelName, fields, config),
  );

  // 2. Service
  writeFile(
    path.join(moduleDir, `${fileName}.service.ts`),
    generateService(modelName, config, fileName, fields),
  );

  // 3. Controller
  writeFile(
    path.join(moduleDir, `${fileName}.controller.ts`),
    generateController(modelName, config, fileName),
  );

  // 4. Module
  writeFile(
    path.join(moduleDir, `${fileName}.module.ts`),
    generateModule(modelName, fileName),
  );

  // ═══════════════════════════════════════════════════════════════════
  // UPDATE APP-MODULE.TS
  // ═══════════════════════════════════════════════════════════════════

  console.log('\n🔄 Updating app-module.ts...');
  updateAppModule(modelName, fileName);

  // ═══════════════════════════════════════════════════════════════════
  // GENERATE PRISMA MIGRATION
  // ═══════════════════════════════════════════════════════════════════

  console.log('\n🔄 Generating Prisma migration...');
  const migrationName = `add_${snakeCase(modelName)}`;

  try {
    // Check if model exists in schema
    const schemaContent = fs.readFileSync(PRISMA_SCHEMA_PATH, 'utf8');
    const modelExists = new RegExp(`^model\\s+${modelName}\\s*\\{`).test(schemaContent);

    if (modelExists) {
      console.log('   Model already exists in Prisma schema, skipping migration');
    } else {
      console.log(`   Note: Model "${modelName}" not found in schema.prisma`);
      console.log('   Please add the model manually to prisma/schema.prisma');
      console.log('   Then run: npx prisma migrate dev --name <migration_name>');
    }
  } catch (err) {
    console.log(`   ⚠️  Could not verify Prisma schema: ${err.message}`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════

  console.log('\n' + '='.repeat(60));
  console.log('✅ MODULE GENERATED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log('');
  console.log('📁 Generated files:');
  console.log(`   src/modules/${fileName}/`);
  console.log(`     ├── dto/${fileName}.dto.ts`);
  console.log(`     ├── ${fileName}.service.ts`);
  console.log(`     ├── ${fileName}.controller.ts`);
  console.log(`     └── ${fileName}.module.ts`);
  console.log('');
  console.log('🔧 Next steps:');
  console.log('1. Add model to prisma/schema.prisma if not exists:');
  console.log('');
  console.log('   model ' + modelName + ' {');
  console.log('     id        Int      @id @default(autoincrement())');
  console.log('     code      String   @unique @db.VarChar(50)');
  console.log('     name      String   @db.VarChar(255)');
  console.log('     isActive  Boolean  @default(true)');
  console.log('     createdAt DateTime @default(now())');
  console.log('     updatedAt DateTime @updatedAt');
  console.log('   }');
  console.log('');
  console.log('2. Run migration:');
  console.log('   npx prisma migrate dev --name add_' + snakeCase(modelName));
  console.log('');
  console.log('3. Regenerate Prisma client:');
  console.log('   npx prisma generate');
  console.log('');
  console.log('4. Start the server:');
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
  console.log('💡 Tip: Add business logic methods to the service file');
  console.log('   The controller already supports transaction blocks!');
  console.log('   Use header "X-Use-Transaction: false" to disable');
  console.log('');
}

main();
