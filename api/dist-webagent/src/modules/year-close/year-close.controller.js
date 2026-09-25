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
exports.YearCloseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
const fiscal_year_service_1 = require("../fiscal-year/fiscal-year.service");
let YearCloseController = class YearCloseController {
    constructor(fiscalYear) {
        this.fiscalYear = fiscalYear;
    }
    async getFiscalYears() {
        const s = await this.fiscalYear.status();
        return api_response_dto_1.ApiResponse.ok(s.years.map((y) => ({ ...y, isLocked: y.closed })));
    }
    async closeYear(body, user) {
        const year = Number(body?.fiscalYear ?? body?.year);
        if (!Number.isInteger(year))
            throw new common_1.BadRequestException('fiscalYear wajib diisi');
        const data = await this.fiscalYear.close(year, user.id);
        return api_response_dto_1.ApiResponse.ok(data, `Tahun buku ${year} berhasil ditutup`);
    }
};
exports.YearCloseController = YearCloseController;
__decorate([
    (0, common_1.Get)('fiscal-years'),
    (0, swagger_1.ApiOperation)({ summary: 'List fiscal years (delegates to GET /fiscal-year)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], YearCloseController.prototype, "getFiscalYears", null);
__decorate([
    (0, common_1.Post)('year-close'),
    (0, swagger_1.ApiOperation)({ summary: 'Close a fiscal year (delegates to POST /fiscal-year/close)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], YearCloseController.prototype, "closeYear", null);
exports.YearCloseController = YearCloseController = __decorate([
    (0, swagger_1.ApiTags)('Year Close - Tutup Tahun (legacy, delegates to /fiscal-year)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/accounting'),
    __metadata("design:paramtypes", [fiscal_year_service_1.FiscalYearService])
], YearCloseController);
