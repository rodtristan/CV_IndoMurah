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
          searchableFields: ['name', 'email'],
          allowedIncludes: ['userRoles'],
          defaultOrderBy: { createdAt: 'desc' },
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
          allowedIncludes: ['userRoles', 'userMenus'],
        });

        const findArgs: any = { where: { id } };

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
    const exists = await this.prisma.user.count({ where: { email: dto.email } });
    if (exists > 0) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const hashedPassword = await argon2.hash(dto.password, { type: argon2.argon2id });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role ?? 'cashier',
        isActive: true,
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({ where: { id }, data: dto });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.del(`user:me:${id}`);

    return updated;
  }

  async softDelete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.del(`user:me:${id}`);

    return updated;
  }

  // ─── UserRole (extra roles, on top of main role field) ──────

  async getRoles(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, userRoles: { where: { isActive: true }, include: { role: true } } },
    });
    if (!user) throw new NotFoundException('User not found');

    return { mainRole: user.role, extraRoles: user.userRoles.map((ur) => ur.role) };
  }

  async assignRole(userId: string, roleId: number) {
    const [user, role] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.role.findUnique({ where: { id: roleId } }),
    ]);
    if (!user) throw new NotFoundException('User not found');
    if (!role) throw new NotFoundException('Role not found');

    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (existing?.isActive) {
      throw new ConflictException('User already has this role');
    }

    const userRole = await this.prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      create: { userId, roleId, isActive: true },
      update: { isActive: true },
    });

    // Seed the menus that come with this role so access is immediate.
    await this.menuService.provisionUserMenusFromRole(userId, roleId);
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.del(`user:me:${userId}`);

    return userRole;
  }

  async revokeRole(userId: string, roleId: number) {
    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (!existing) throw new NotFoundException('User does not have this role');

    const userRole = await this.prisma.userRole.update({
      where: { userId_roleId: { userId, roleId } },
      data: { isActive: false },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);
    await this.redis.del(`user:me:${userId}`);

    return userRole;
  }
}
