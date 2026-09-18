import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { MenuService } from '../menu/menu-service';
import { CreateUserDto, UpdateUserDto } from './dto/user-dto';

@Injectable()
export class UserService {
  private readonly CACHE_PREFIX = 'users';
  private readonly CACHE_TTL = 60; // 60 seconds

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
    private menuService: MenuService,
  ) {}

  async findAll(query: Record<string, any>) {
    const cacheKey = this.queryService.generateCacheKey(this.CACHE_PREFIX, query);

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          searchableFields: ['Name', 'Email'],
          allowedIncludes: ['UserRoles'],
          defaultOrderBy: { CreatedAt: 'desc' },
        });

        const findArgs: any = {
          where: prismaQuery.where,
          orderBy: prismaQuery.orderBy,
          skip: prismaQuery.skip,
          take: prismaQuery.take,
        };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        const [data, total] = await Promise.all([
          this.prisma.user.findMany(findArgs),
          this.prisma.user.count({ where: prismaQuery.where }),
        ]);

        return { data, total, skip: prismaQuery.skip, take: prismaQuery.take };
      },
      this.CACHE_TTL,
    );
  }

  async findOne(id: string, query: Record<string, any> = {}) {
    const cacheKey = `${this.CACHE_PREFIX}:${id}:${this.queryService.generateCacheKey('q', query)}`;

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          allowedIncludes: ['UserRoles', 'UserMenus'],
        });

        const findArgs: any = { where: { ID: id } };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        return this.prisma.user.findUnique(findArgs);
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.count({
      where: { CompanyID: dto.companyId, Username: dto.username },
    });
    if (exists > 0) {
      throw new ConflictException('Username sudah terdaftar di perusahaan ini');
    }

    const hashedPassword = await argon2.hash(dto.password, { type: argon2.argon2id });

    const user = await this.prisma.user.create({
      data: {
        CompanyID: dto.companyId,
        Username: dto.username,
        Email: dto.email,
        Password: hashedPassword,
        Name: dto.name,
        Role: 'cashier',
        IsActive: true,
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { ID: id } });
    if (!user) throw new NotFoundException('User not found');

    const data: Record<string, unknown> = {};
    if (dto.username !== undefined) data.Username = dto.username;
    if (dto.email !== undefined) data.Email = dto.email;
    if (dto.name !== undefined) data.Name = dto.name;
    if (dto.isActive !== undefined) data.IsActive = dto.isActive;

    const updated = await this.prisma.user.update({ where: { ID: id }, data });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.del(`user:me:${id}`);

    return updated;
  }

  async softDelete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { ID: id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { ID: id },
      data: { IsActive: false },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.del(`user:me:${id}`);

    return updated;
  }

  // ─── UserRole (extra roles, on top of main role field) ──────

  async getRoles(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { ID: userId },
      select: { Role: true, UserRoles: { where: { IsActive: true }, include: { Role: true } } },
    });
    if (!user) throw new NotFoundException('User not found');

    return { mainRole: user.Role, extraRoles: user.UserRoles.map((ur) => ur.Role) };
  }

  async assignRole(userId: string, roleId: number) {
    const [user, role] = await Promise.all([
      this.prisma.user.findUnique({ where: { ID: userId } }),
      this.prisma.role.findUnique({ where: { ID: roleId } }),
    ]);
    if (!user) throw new NotFoundException('User not found');
    if (!role) throw new NotFoundException('Role not found');

    const existing = await this.prisma.userRole.findUnique({
      where: { UserID_RoleID: { UserID: userId, RoleID: roleId } },
    });
    if (existing?.IsActive) {
      throw new ConflictException('User already has this role');
    }

    const userRole = await this.prisma.userRole.upsert({
      where: { UserID_RoleID: { UserID: userId, RoleID: roleId } },
      create: { UserID: userId, RoleID: roleId, IsActive: true },
      update: { IsActive: true },
    });

    // Seed the menus that come with this role so access is immediate.
    await this.menuService.provisionUserMenusFromRole(userId, roleId);
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.del(`user:me:${userId}`);

    return userRole;
  }

  async revokeRole(userId: string, roleId: number) {
    const existing = await this.prisma.userRole.findUnique({
      where: { UserID_RoleID: { UserID: userId, RoleID: roleId } },
    });
    if (!existing) throw new NotFoundException('User does not have this role');

    const userRole = await this.prisma.userRole.update({
      where: { UserID_RoleID: { UserID: userId, RoleID: roleId } },
      data: { IsActive: false },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.del(`user:me:${userId}`);

    return userRole;
  }
}
