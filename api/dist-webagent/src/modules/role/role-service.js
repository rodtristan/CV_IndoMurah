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
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma-service");
const redis_service_1 = require("../../common/redis/redis-service");
const query_service_1 = require("../../common/query/query-service");
let RoleService = class RoleService {
    constructor(prisma, redis, queryService) {
        this.prisma = prisma;
        this.redis = redis;
        this.queryService = queryService;
        this.CACHE_PREFIX = 'roles';
        this.CACHE_TTL = 120;
    }
    async findAll(query) {
        const cacheKey = this.queryService.generateCacheKey(this.CACHE_PREFIX, query);
        return this.redis.getOrSet(cacheKey, async () => {
            const pq = this.queryService.buildPrismaQuery(query, {
                searchableFields: ['RoleName', 'RoleDescription'],
                allowedIncludes: ['UserRoles'],
                defaultOrderBy: { CreatedAt: 'desc' },
            });
            const findArgs = { where: pq.where, orderBy: pq.orderBy, skip: pq.skip, take: pq.take };
            if (pq.select)
                findArgs.select = pq.select;
            else if (pq.include)
                findArgs.include = pq.include;
            const [data, total] = await Promise.all([
                this.prisma.role.findMany(findArgs),
                this.prisma.role.count({ where: pq.where }),
            ]);
            return { data, total, skip: pq.skip, take: pq.take };
        }, this.CACHE_TTL);
    }
    async findOne(id, query = {}) {
        const cacheKey = `${this.CACHE_PREFIX}:${id}:${this.queryService.generateCacheKey('q', query)}`;
        return this.redis.getOrSet(cacheKey, async () => {
            const pq = this.queryService.buildPrismaQuery(query, { allowedIncludes: ['UserRoles'] });
            const findArgs = { where: { ID: id } };
            if (pq.select)
                findArgs.select = pq.select;
            else if (pq.include)
                findArgs.include = pq.include;
            return this.prisma.role.findUnique(findArgs);
        }, this.CACHE_TTL);
    }
    async create(data) {
        const result = await this.prisma.role.create({ data });
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        return result;
    }
    async update(id, data) {
        const role = await this.prisma.role.findUnique({ where: { ID: id } });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        if (this.isAdminRole(role.RoleName)) {
            const newName = data?.RoleName ?? data?.roleName;
            const newActive = data?.IsActive ?? data?.isActive;
            if ((newName !== undefined && !this.isAdminRole(String(newName))) || newActive === false) {
                throw new common_1.BadRequestException('Role Administrator tidak boleh diganti nama atau dinonaktifkan');
            }
        }
        const result = await this.prisma.role.update({ where: { ID: id }, data });
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        await this.redis.invalidatePattern('authz:user:*');
        return result;
    }
    async remove(id) {
        const role = await this.prisma.role.findUnique({ where: { ID: id } });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        if (this.isAdminRole(role.RoleName)) {
            throw new common_1.BadRequestException('Role Administrator tidak boleh dihapus');
        }
        const result = await this.prisma.role.update({ where: { ID: id }, data: { IsActive: false } });
        await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
        await this.redis.invalidatePattern('authz:user:*');
        return result;
    }
    isAdminRole(name) {
        return ['administrator', 'admin'].includes(String(name ?? '').trim().toLowerCase());
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        query_service_1.QueryService])
], RoleService);
