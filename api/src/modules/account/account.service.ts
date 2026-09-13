import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountService {
  private readonly CACHE_PREFIX = 'accounts';

  constructor(
    private prisma: PrismaService,
    private queryService: QueryService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['code', 'name'],
      allowedIncludes: ['parent', 'children'],
      defaultOrderBy: { code: 'asc' },
    });

    const findArgs: Prisma.AccountFindManyArgs = {
      where: prismaQuery.where as Prisma.AccountWhereInput,
      orderBy: prismaQuery.orderBy as Prisma.AccountOrderByWithRelationInput,
      skip: prismaQuery.skip,
      take: prismaQuery.take,
    };

    if (prismaQuery.select) {
      findArgs.select = prismaQuery.select as Prisma.AccountSelect;
    } else if (prismaQuery.include) {
      findArgs.include = prismaQuery.include as Prisma.AccountInclude;
    }

    const [data, total] = await Promise.all([
      this.prisma.account.findMany(findArgs),
      this.prisma.account.count({ where: prismaQuery.where }),
    ]);

    return { data, total, skip: prismaQuery.skip, take: prismaQuery.take };
  }

  async findOne(id: number) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: { code: 'asc' },
        },
      },
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async create(dto: CreateAccountDto) {
    const existing = await this.prisma.account.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Account code already exists');

    return this.prisma.account.create({
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        parentId: dto.parent_id,
        isActive: dto.is_active ?? true,
      },
    });
  }

  async update(id: number, dto: UpdateAccountDto) {
    const account = await this.prisma.account.findUnique({ where: { id } });
    if (!account) throw new NotFoundException('Account not found');

    if (dto.code && dto.code !== account.code) {
      const existing = await this.prisma.account.findUnique({ where: { code: dto.code } });
      if (existing) throw new ConflictException('Account code already exists');
    }

    return this.prisma.account.update({
      where: { id },
      data: {
        ...(dto.code && { code: dto.code }),
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type }),
        ...(dto.parent_id !== undefined && { parentId: dto.parent_id }),
        ...(dto.is_active !== undefined && { isActive: dto.is_active }),
      },
    });
  }

  async remove(id: number) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: { children: true },
    });
    if (!account) throw new NotFoundException('Account not found');

    // Check if has children
    if (account.children.length > 0) {
      throw new ConflictException('Cannot delete account with child accounts');
    }

    return this.prisma.account.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getTree() {
    // Get all active accounts
    const accounts = await this.prisma.account.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { code: 'asc' },
        },
      },
    });

    // Return only root accounts (no parent)
    return accounts.filter((acc) => !acc.parentId);
  }

  async getByType(type: string) {
    return this.prisma.account.findMany({
      where: {
        isActive: true,
        type: type as any,
      },
      orderBy: { code: 'asc' },
    });
  }
}
