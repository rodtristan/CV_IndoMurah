import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';

@Injectable()
export class RoleService {
  private readonly CACHE_PREFIX = 'roles';
  private readonly CACHE_TTL = 120;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
  ) {}

  async findAll(query: Record<string, any>) {
    const cacheKey = this.queryService.generateCacheKey(this.CACHE_PREFIX, query);
    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const pq = this.queryService.buildPrismaQuery(query, {
          searchableFields: ['RoleName', 'RoleDescription'],
          allowedIncludes: ['UserRoles'],
          defaultOrderBy: { CreatedAt: 'desc' },
        });
        const findArgs: any = { where: pq.where, orderBy: pq.orderBy, skip: pq.skip, take: pq.take };
        if (pq.select) findArgs.select = pq.select; else if (pq.include) findArgs.include = pq.include;
        const [data, total] = await Promise.all([
          this.prisma.role.findMany(findArgs),
          this.prisma.role.count({ where: pq.where }),
        ]);
        return { data, total, skip: pq.skip, take: pq.take };
      },
      this.CACHE_TTL,
    );
  }

  async findOne(id: number, query: Record<string, any> = {}) {
    const cacheKey = `${this.CACHE_PREFIX}:${id}:${this.queryService.generateCacheKey('q', query)}`;
    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const pq = this.queryService.buildPrismaQuery(query, { allowedIncludes: ['UserRoles'] });
        const findArgs: any = { where: { ID: id } };
        if (pq.select) findArgs.select = pq.select; else if (pq.include) findArgs.include = pq.include;
        return this.prisma.role.findUnique(findArgs);
      },
      this.CACHE_TTL,
    );
  }

  async create(data: any) {
    const result = await this.prisma.role.create({ data });
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    return result;
  }

  async update(id: number, data: any) {
    const role = await this.prisma.role.findUnique({ where: { ID: id } });
    if (!role) throw new NotFoundException('Role not found');
    if (this.isAdminRole(role.RoleName)) {
      const newName = data?.RoleName ?? data?.roleName;
      const newActive = data?.IsActive ?? data?.isActive;
      if ((newName !== undefined && !this.isAdminRole(String(newName))) || newActive === false) {
        throw new BadRequestException('Role Administrator tidak boleh diganti nama atau dinonaktifkan');
      }
    }
    const result = await this.prisma.role.update({ where: { ID: id }, data });
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern('authz:user:*');
    return result;
  }

  async remove(id: number) {
    const role = await this.prisma.role.findUnique({ where: { ID: id } });
    if (!role) throw new NotFoundException('Role not found');
    if (this.isAdminRole(role.RoleName)) {
      throw new BadRequestException('Role Administrator tidak boleh dihapus');
    }
    const result = await this.prisma.role.update({ where: { ID: id }, data: { IsActive: false } });
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.invalidatePattern('authz:user:*');
    return result;
  }

  private isAdminRole(name: string | null | undefined): boolean {
    return ['administrator', 'admin'].includes(String(name ?? '').trim().toLowerCase());
  }
}
