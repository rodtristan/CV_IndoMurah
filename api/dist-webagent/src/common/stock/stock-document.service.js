"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockDocumentService = void 0;
const common_1 = require("@nestjs/common");
const base_service_1 = require("../templates/base.service");
const MSG = 'Operasi massal/upsert tidak tersedia untuk dokumen stok. Gunakan simpan/ubah/hapus per dokumen.';
class StockDocumentService extends base_service_1.BaseService {
    deny() {
        throw new common_1.BadRequestException(MSG);
    }
    async create() { return this.deny(); }
    async createBulk() { return this.deny(); }
    async patchByFilterReference() { return this.deny(); }
    async patchBulk() { return this.deny(); }
    async deleteByFilterReference() { return this.deny(); }
    async deleteBulk() { return this.deny(); }
    async upsert() { return this.deny(); }
    async upsertByFilterReference() { return this.deny(); }
    async upsertBulk() { return this.deny(); }
}
exports.StockDocumentService = StockDocumentService;
