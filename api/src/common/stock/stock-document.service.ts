import { BadRequestException } from '@nestjs/common';
import { BaseService } from '../templates/base.service';

const MSG = 'Operasi massal/upsert tidak tersedia untuk dokumen stok. Gunakan simpan/ubah/hapus per dokumen.';

/**
 * BaseService untuk dokumen stok (Barang Masuk/Keluar, Transfer, Opname).
 * Operasi generik yang melewati StockLedgerService (bulk, by-filter, upsert, create generik)
 * ditolak; subclass WAJIB meng-override patchById & deleteById agar stok ikut dikoreksi.
 */
export abstract class StockDocumentService<T extends Record<string, any>, C extends Record<string, any>, U extends Record<string, any>> extends BaseService<T, C, U> {
  protected deny(): never {
    throw new BadRequestException(MSG);
  }
  async create(): Promise<T> { return this.deny(); }
  async createBulk(): Promise<any> { return this.deny(); }
  async patchByFilterReference(): Promise<T[]> { return this.deny(); }
  async patchBulk(): Promise<any> { return this.deny(); }
  async deleteByFilterReference(): Promise<{ count: number }> { return this.deny(); }
  async deleteBulk(): Promise<any> { return this.deny(); }
  async upsert(): Promise<T> { return this.deny(); }
  async upsertByFilterReference(): Promise<T> { return this.deny(); }
  async upsertBulk(): Promise<any> { return this.deny(); }

  abstract patchById(id: any, dto: Partial<U>, userId?: string): Promise<T>;
  abstract deleteById(id: any, userId?: string): Promise<T>;
}
