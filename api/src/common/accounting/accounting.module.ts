import { Global, Module } from '@nestjs/common';
import { AutoJournalService } from './auto-journal.service';
import { DepositLedgerService } from './deposit-ledger.service';

/** Global: inject AutoJournalService / DepositLedgerService anywhere without importing this module. */
@Global()
@Module({
  providers: [AutoJournalService, DepositLedgerService],
  exports: [AutoJournalService, DepositLedgerService],
})
export class AutoAccountingModule {}
