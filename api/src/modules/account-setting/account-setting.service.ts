import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';

export const ACCOUNT_SETTING_KEYS = [
  'cash', 'inventory', 'receivable', 'payable', 'sales', 'salesDiscount', 'cogs',
  'salesReturn', 'purchaseReturn', 'vatOut', 'vatIn', 'custDeposit', 'suppDeposit',
  'shipping', 'stockDiff', 'retained', 'currentProfit', 'otherIncome', 'otherExpense',
];

@Injectable()
export class AccountSettingService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Record<string, number | null>> {
    const rows = await this.prisma.accountSetting.findMany();
    const out: Record<string, number | null> = {};
    for (const k of ACCOUNT_SETTING_KEYS) out[k] = null;
    for (const r of rows) out[r.Key] = r.AccountID;
    return out;
  }

  async saveAll(values: Record<string, number | string | null>) {
    const entries = Object.entries(values ?? {});
    for (const [k] of entries) {
      if (!ACCOUNT_SETTING_KEYS.includes(k)) throw new BadRequestException(`Kunci setting tidak dikenal: ${k}`);
    }
    const norm = entries.map(([k, v]) => [k, v === null || v === '' || v === undefined ? null : Number(v)] as [string, number | null]);
    const ids = [...new Set(norm.map(([, v]) => v).filter((v): v is number => v !== null))];
    if (ids.some((n) => !Number.isInteger(n))) throw new BadRequestException('ID perkiraan tidak valid');
    if (ids.length) {
      const found = await this.prisma.account.count({ where: { ID: { in: ids } } });
      if (found !== ids.length) throw new BadRequestException('Ada perkiraan yang tidak ditemukan');
    }
    await this.prisma.$transaction(
      norm.map(([k, AccountID]) =>
        this.prisma.accountSetting.upsert({ where: { Key: k }, create: { Key: k, AccountID }, update: { AccountID } }),
      ),
    );
    return this.getAll();
  }
}
