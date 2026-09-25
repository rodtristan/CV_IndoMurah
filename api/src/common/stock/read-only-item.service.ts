import { BadRequestException } from '@nestjs/common';
import { BaseService } from '../templates/base.service';

const MSG =
  'Baris item dokumen stok/transaksi tidak dapat diubah langsung karena akan membuat stok tidak sinkron. Ubah melalui dokumen induknya.';

/**
 * BaseService untuk tabel item dokumen (SaleItem, PurchaseItem, StockInItem, ...):
 * hanya baca. Semua operasi tulis generik ditolak — perubahan item harus lewat
 * service dokumen induk yang mencatat mutasi ke StockLedger.
 */
export abstract class ReadOnlyItemService<T extends Record<string, any>, C extends Record<string, any>, U extends Record<string, any>> extends BaseService<T, C, U> {
  private deny(): never {
    throw new BadRequestException(MSG);
  }
  async create(): Promise<T> { return this.deny(); }
  async createBulk(): Promise<any> { return this.deny(); }
  async patchById(): Promise<T> { return this.deny(); }
  async patchByFilterReference(): Promise<T[]> { return this.deny(); }
  async patchBulk(): Promise<any> { return this.deny(); }
  async deleteById(): Promise<T> { return this.deny(); }
  async deleteByFilterReference(): Promise<{ count: number }> { return this.deny(); }
  async deleteBulk(): Promise<any> { return this.deny(); }
  async upsert(): Promise<T> { return this.deny(); }
  async upsertByFilterReference(): Promise<T> { return this.deny(); }
  async upsertBulk(): Promise<any> { return this.deny(); }
}
