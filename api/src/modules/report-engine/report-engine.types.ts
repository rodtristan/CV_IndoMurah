// Contract mirrors web/src/lib/report/types.ts
import { PrismaService } from '../../common/prisma/prisma-service';

export type FieldType = 'string' | 'number' | 'currency' | 'date' | 'datetime';
export interface ReportFieldDef { key: string; label: string; type: FieldType }
export type ReportParamType = 'date' | 'select' | 'text' | 'lookup' | 'checkbox';
export interface ReportParamDef {
  key: string;
  label: string;
  type: ReportParamType;
  options?: { value: string; label: string }[];
  source?: { endpoint: string; valueField: string; labelField: string; codeField?: string };
  defaultValue?: string | boolean;
  rangeWith?: string;
}
export interface ReportChartHint {
  type: 'bar' | 'line';
  labelField: string;
  valueFields: { key: string; label: string }[];
}
export interface ReportCatalogItem {
  key: string;
  group: string;
  title: string;
  description: string;
  params: ReportParamDef[];
  fields: ReportFieldDef[];
  variants?: { key: string; title: string }[];
  /** render the result rows as a chart above the table */
  chart?: ReportChartHint;
}

export interface ReportContext {
  prisma: PrismaService;
  variant?: string;
}

export type ReportRow = Record<string, unknown>;

export interface ReportProvider extends ReportCatalogItem {
  /** param keys that must be present (400 otherwise) */
  required?: string[];
  run(params: Record<string, any>, ctx: ReportContext): Promise<ReportRow[]>;
}

export const MAX_ROWS = 20000;
