import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';

@Injectable()
export class UnitService {
  private readonly CACHE_PREFIX = 'units';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private queryService: QueryService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['code', 'name', 'abbreviation'],
      allowedIncludes: ['products'],
      defaultOrderBy: { id: 'asc' },
    });

    const findArgs: Record<string, unknown> = {
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
      this.prisma.unit.findMany(findArgs as Parameters<typeof this.prisma.unit.findMany>[0]),
      this.prisma.unit.count({ where: prismaQuery.where }),
    ]);

    return { data, total, skip: prismaQuery.skip, take: prismaQuery.take };
  }

  async findOne(id: number) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async create(dto: CreateUnitDto) {
    const existing = await this.prisma.unit.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Unit code already exists');

    return this.prisma.unit.create({ data: dto });
  }

  async update(id: number, dto: UpdateUnitDto) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException('Unit not found');

    if (dto.code && dto.code !== unit.code) {
      const existing = await this.prisma.unit.findUnique({ where: { code: dto.code } });
      if (existing) throw new ConflictException('Unit code already exists');
    }

    return this.prisma.unit.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException('Unit not found');

    return this.prisma.unit.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
