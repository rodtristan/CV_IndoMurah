"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const journal_service_1 = require("./journal-service");
const journal_dto_1 = require("./journal.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let JournalController = class JournalController {
    constructor(journalService) {
        this.journalService = journalService;
    }
    async create(dto) {
        const data = await this.journalService.create(dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Journal entry created successfully');
    }
    async findAll(dto) {
        const data = await this.journalService.findAll(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async findById(id) {
        const data = await this.journalService.findById(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async update(id, dto) {
        const data = await this.journalService.update(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Journal entry updated');
    }
    async post(id) {
        const data = await this.journalService.post(id);
        return api_response_dto_1.ApiResponse.ok(data, 'Journal entry posted');
    }
    async unpost(id) {
        const data = await this.journalService.unpost(id);
        return api_response_dto_1.ApiResponse.ok(data, 'Journal entry unposted');
    }
    async cancel(id, dto) {
        const data = await this.journalService.cancel(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Journal entry cancelled');
    }
    async getAccountBalance(dto) {
        const data = await this.journalService.getAccountBalance(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getTrialBalance(dto) {
        const data = await this.journalService.getTrialBalance(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.JournalController = JournalController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new journal entry (Jurnal Umum)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [journal_dto_1.CreateJournalEntryDto]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all journal entries' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [journal_dto_1.JournalEntryQueryDto]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get journal entry by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update journal entry (unposted only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, journal_dto_1.UpDateJournalEntryDto]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/post'),
    (0, swagger_1.ApiOperation)({ summary: 'Post journal entry (Kunci transaksi)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "post", null);
__decorate([
    (0, common_1.Post)(':id/unpost'),
    (0, swagger_1.ApiOperation)({ summary: 'Unpost journal entry (Buka transaksi)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "unpost", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel journal entry' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, journal_dto_1.CancelJournalEntryDto]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)('reports/account-balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get account balance as of date' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [journal_dto_1.AccountBalanceDto]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "getAccountBalance", null);
__decorate([
    (0, common_1.Get)('reports/trial-balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get trial balance report (Neraca Saldo)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [journal_dto_1.TrialBalanceDto]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "getTrialBalance", null);
exports.JournalController = JournalController = __decorate([
    (0, swagger_1.ApiTags)('Journal - Jurnal Umum'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/journal'),
    __metadata("design:paramtypes", [journal_service_1.JournalService])
], JournalController);
