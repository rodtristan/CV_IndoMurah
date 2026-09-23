import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';

@Injectable()
export class PaymentMethodService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.paymentMethod.findMany({
      where: { IsActive: true },
      orderBy: { SortOrder: 'asc' },
    });
  }
}
