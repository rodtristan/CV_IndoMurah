"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma-service");
const redis_service_1 = require("../redis/redis-service");
const query_service_1 = require("../query/query-service");
function toPascalKey(key) {
    if (!key)
        return key;
    const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
    return capitalized.replace(/Id\b/g, 'ID');
}
function toPrismaData(obj) {
    if (!obj || typeof obj !== 'object')
        return obj;
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        result[toPascalKey(key)] = value;
    }
    return result;
}
let BaseService = class BaseService {
    constructor(prisma, redis, queryService, config) {
        this.prisma = prisma;
        this.redis = redis;
        this.queryService = queryService;
        this.config = {
            maxTake: 100,
            defaultTake: 20,
            cacheTtl: 60,
            softDelete: false,
            softDeleteField: 'IsActive',
            defaultOrderBy: { CreatedAt: 'desc' },
            ...config,
        };
        this.CACHE_PREFIX = config.modelName;
        this.CACHE_TTL = config.cacheTtl ?? 60;
    }
    async findAll(query = {}) {
        const cacheKey = this.queryService.generateCacheKey(this.CACHE_PREFIX, query);
        return this.redis.getOrSet(cacheKey, async () => {
            const prismaQuery = this.queryService.buildPrismaQuery(query, {
                searchableFields: this.config.searchableFields,
                allowedIncludes: this.config.allowedIncludes,
                allowedSortFields: this.config.allowedSortFields,
                allowedFields: this.config.allowedSelectFields,
                defaultOrderBy: this.config.defaultOrderBy,
                maxTake: this.config.maxTake,
                defaultTake: this.config.defaultTake,
            });
            if (this.config.softDelete && this.config.softDeleteField) {
                prismaQuery.where[this.config.softDeleteField] = true;
            }
            const findArgs = {
                where: prismaQuery.where,
                orderBy: prismaQuery.orderBy,
                skip: prismaQuery.skip,
                take: prismaQuery.take,
            };
            if (prismaQuery.select) {
                findArgs.select = prismaQuery.select;
            }
            else if (prismaQuery.include) {
                findArgs.include = prismaQuery.include;
            }
            const model = this.getModel();
            const [data, total] = await Promise.all([
                model.findMany(findArgs),
                model.count({ where: prismaQuery.where }),
            ]);
            return { data, total, skip: prismaQuery.skip, take: prismaQuery.take };
        }, this.CACHE_TTL);
    }
    async getCount(query = {}) {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
            searchableFields: this.config.searchableFields,
        });
        if (this.config.softDelete && this.config.softDeleteField) {
            prismaQuery.where[this.config.softDeleteField] = true;
        }
        const model = this.getModel();
        const count = await model.count({ where: prismaQuery.where });
        return { count };
    }
    async findById(id, query = {}) {
        const cacheKey = `${this.CACHE_PREFIX}:${id}:${this.queryService.generateCacheKey('q', query)}`;
        return this.redis.getOrSet(cacheKey, async () => {
            const prismaQuery = this.queryService.buildPrismaQuery(query, {
                allowedIncludes: this.config.allowedIncludes,
            });
            const findArgs = {
                where: { [this.config.primaryKey]: id },
            };
            if (prismaQuery.select) {
                findArgs.select = prismaQuery.select;
            }
            else if (prismaQuery.include) {
                findArgs.include = prismaQuery.include;
            }
            const model = this.getModel();
            return model.findUnique(findArgs);
        }, this.CACHE_TTL);
    }
    async findByField(field, value, query = {}) {
        if ((0, query_service_1.isSensitiveFieldPath)(field)) {
            throw new common_1.BadRequestException(`Field "${field}" tidak boleh dipakai dalam query`);
        }
        const cacheKey = `${this.CACHE_PREFIX}:by:${field}:${value}:${this.queryService.generateCacheKey('q', query)}`;
        return this.redis.getOrSet(cacheKey, async () => {
            const prismaQuery = this.queryService.buildPrismaQuery(query, {
                allowedIncludes: this.config.allowedIncludes,
            });
            const findArgs = {
                where: { [field]: value },
            };
            if (prismaQuery.select) {
                findArgs.select = prismaQuery.select;
            }
            else if (prismaQuery.include) {
                findArgs.include = prismaQuery.include;
            }
            const model = this.getModel();
            return model.findFirst(findArgs);
        }, this.CACHE_TTL);
    }
    async create(dto) {
        let data = toPrismaData({ ...dto });
        if (this.config.autoRelations) {
            for (const relation of this.config.autoRelations) {
                data[relation.field] = relation.value;
            }
        }
        const model = this.getModel();
        const result = await model.create({ data });
        await this.invalidateCache();
        return result;
    }
    async createBulk(dtos) {
        const success = [];
        const failed = [];
        const model = this.getModel();
        for (const dto of dtos) {
            try {
                let data = toPrismaData({ ...dto });
                if (this.config.autoRelations) {
                    for (const relation of this.config.autoRelations) {
                        data[relation.field] = relation.value;
                    }
                }
                const result = await model.create({ data });
                success.push(result);
            }
            catch (error) {
                failed.push({
                    data: dto,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        if (success.length > 0) {
            await this.invalidateCache();
        }
        return {
            success,
            failed,
            total: dtos.length,
            successCount: success.length,
            failedCount: failed.length,
        };
    }
    async patchById(id, dto) {
        const model = this.getModel();
        const exists = await model.findUnique({
            where: { [this.config.primaryKey]: id },
        });
        if (!exists) {
            throw new common_1.NotFoundException(`${this.config.modelName} not found`);
        }
        const result = await model.update({
            where: { [this.config.primaryKey]: id },
            data: toPrismaData(dto),
        });
        await this.invalidateCache();
        await this.invalidateItemCache(id);
        return result;
    }
    async patchByFilterReference(filter, dto) {
        const model = this.getModel();
        const where = toPrismaData(filter);
        const count = await model.count({ where });
        if (count === 0) {
            throw new common_1.NotFoundException(`${this.config.modelName}(s) not found`);
        }
        const results = await model.updateMany({
            where,
            data: toPrismaData(dto),
        });
        await this.invalidateCache();
        return model.findMany({ where });
    }
    async patchBulk(ids, dto) {
        const success = [];
        const failed = [];
        const model = this.getModel();
        for (const id of ids) {
            try {
                const result = await model.update({
                    where: { [this.config.primaryKey]: id },
                    data: toPrismaData(dto),
                });
                success.push(result);
            }
            catch (error) {
                if (error instanceof common_1.NotFoundException) {
                    failed.push({ id, error: 'Not found' });
                }
                else {
                    failed.push({
                        id,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }
        }
        if (success.length > 0) {
            await this.invalidateCache();
        }
        return {
            success,
            failed,
            total: ids.length,
            successCount: success.length,
            failedCount: failed.length,
        };
    }
    async deleteById(id) {
        const model = this.getModel();
        const exists = await model.findUnique({
            where: { [this.config.primaryKey]: id },
        });
        if (!exists) {
            throw new common_1.NotFoundException(`${this.config.modelName} not found`);
        }
        let result;
        if (this.config.softDelete && this.config.softDeleteField) {
            result = await model.update({
                where: { [this.config.primaryKey]: id },
                data: { [this.config.softDeleteField]: false },
            });
        }
        else {
            result = await model.delete({
                where: { [this.config.primaryKey]: id },
            });
        }
        await this.invalidateCache();
        await this.invalidateItemCache(id);
        return result;
    }
    async deleteByFilterReference(filter) {
        const model = this.getModel();
        const where = toPrismaData(filter);
        const count = await model.count({ where });
        if (count === 0) {
            throw new common_1.NotFoundException(`${this.config.modelName}(s) not found`);
        }
        let result;
        if (this.config.softDelete && this.config.softDeleteField) {
            result = await model.updateMany({
                where,
                data: { [this.config.softDeleteField]: false },
            });
        }
        else {
            result = await model.deleteMany({
                where,
            });
        }
        await this.invalidateCache();
        return { count: result.count ?? count };
    }
    async deleteBulk(ids) {
        const success = [];
        const failed = [];
        const model = this.getModel();
        for (const id of ids) {
            try {
                const exists = await model.findUnique({
                    where: { [this.config.primaryKey]: id },
                });
                if (!exists) {
                    failed.push({ id, error: 'Not found' });
                    continue;
                }
                let result;
                if (this.config.softDelete && this.config.softDeleteField) {
                    result = await model.update({
                        where: { [this.config.primaryKey]: id },
                        data: { [this.config.softDeleteField]: false },
                    });
                }
                else {
                    result = await model.delete({
                        where: { [this.config.primaryKey]: id },
                    });
                }
                success.push(result);
            }
            catch (error) {
                failed.push({
                    id,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        if (success.length > 0) {
            await this.invalidateCache();
        }
        return {
            success,
            failed,
            total: ids.length,
            successCount: success.length,
            failedCount: failed.length,
        };
    }
    async upsert(where, createDto, updateDto) {
        const model = this.getModel();
        const result = await model.upsert({
            where: toPrismaData(where),
            create: toPrismaData(createDto),
            update: toPrismaData(updateDto),
        });
        await this.invalidateCache();
        return result;
    }
    async upsertByFilterReference(filter, createDto, updateDto) {
        const model = this.getModel();
        const where = toPrismaData(filter);
        const existing = await model.findFirst({
            where,
        });
        if (existing) {
            const result = await model.update({
                where: { [this.config.primaryKey]: existing[this.config.primaryKey] },
                data: toPrismaData(updateDto),
            });
            await this.invalidateCache();
            return result;
        }
        else {
            const result = await model.create({
                data: toPrismaData({ ...filter, ...createDto }),
            });
            await this.invalidateCache();
            return result;
        }
    }
    async upsertBulk(items) {
        const success = [];
        const failed = [];
        const model = this.getModel();
        for (const item of items) {
            try {
                const itemWhere = toPrismaData(item.where);
                const existing = await model.findFirst({
                    where: itemWhere,
                });
                let result;
                if (existing) {
                    result = await model.update({
                        where: { [this.config.primaryKey]: existing[this.config.primaryKey] },
                        data: toPrismaData(item.update),
                    });
                }
                else {
                    result = await model.create({
                        data: toPrismaData({ ...item.where, ...item.create }),
                    });
                }
                success.push(result);
            }
            catch (error) {
                failed.push({
                    data: item,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        if (success.length > 0) {
            await this.invalidateCache();
        }
        return {
            success,
            failed,
            total: items.length,
            successCount: success.length,
            failedCount: failed.length,
        };
    }
    getModel() {
        return this.prisma[this.config.modelName];
    }
    async invalidateCache() {
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    }
    async invalidateItemCache(id) {
        await this.redis.del(`${this.CACHE_PREFIX}:${id}:*`);
    }
};
exports.BaseService = BaseService;
exports.BaseService = BaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService, Object])
], BaseService);
