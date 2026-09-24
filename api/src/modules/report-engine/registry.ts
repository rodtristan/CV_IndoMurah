import { ReportProvider } from './report-engine.types';
import { masterProviders } from './providers/master';
import { purchaseProviders } from './providers/purchase';
import { saleProviders, profitProviders } from './providers/sale';
import { debtProviders, receivableProviders } from './providers/debt';
import { stockProviders } from './providers/stock';
import { financeProviders } from './providers/finance';

const byGroup = (g: string) => financeProviders.filter((p) => p.group === g);

export const REPORT_PROVIDERS: ReportProvider[] = [
  ...masterProviders,
  ...purchaseProviders,
  ...saleProviders,
  ...debtProviders,
  ...receivableProviders,
  ...stockProviders,
  ...byGroup('Kas'),
  ...profitProviders,
  ...byGroup('Jurnal'),
  ...byGroup('Buku Besar'),
  ...byGroup('Keuangan'),
  ...byGroup('Daftar Perkiraan'),
];

export const REPORT_MAP = new Map(REPORT_PROVIDERS.map((p) => [p.key, p]));
