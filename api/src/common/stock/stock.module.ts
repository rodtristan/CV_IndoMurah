import { Global, Module } from '@nestjs/common';
import { StockLedgerService } from './stock-ledger.service';
import { PartyBalanceService } from './party-balance.service';

/**
 * Modul global stok: StockLedgerService (satu-satunya pintu perubahan stok)
 * dan PartyBalanceService (piutang/hutang turunan dari dokumen).
 */
@Global()
@Module({
  providers: [StockLedgerService, PartyBalanceService],
  exports: [StockLedgerService, PartyBalanceService],
})
export class StockModule {}
