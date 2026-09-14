import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { CreateUserDto, UpdateUserDto } from './dto/user-dto';

@Injectable()
export class UserService {
  private readonly CACHE_PREFIX = 'users';
  private readonly CACHE_TTL = 60; // 60 seconds

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
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          searchableFields: ['name', 'email'],
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

  async findOne(id: string) {
    const cacheKey = `${this.CACHE_PREFIX}:${id}`;

    return this.redis.getOrSet(
      cacheKey,
      () => this.prisma.user.findUnique({ where: { id } }),
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
    await this.redis.del(`${this.CACHE_PREFIX}:${id}`);

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
    await this.redis.del(`${this.CACHE_PREFIX}:${id}`);

    return updated;
  }
}
