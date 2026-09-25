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
exports.FiscalYearController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
const fiscal_year_service_1 = require("./fiscal-year.service");
let FiscalYearController = class FiscalYearController {
    constructor(service) {
        this.service = service;
    }
    async status() {
        return api_response_dto_1.ApiResponse.ok(await this.service.status());
    }
    async close(body, user) {
        return api_response_dto_1.ApiResponse.ok(await this.service.close(body?.year, user?.id), `Tahun ${body?.year} berhasil ditutup`);
    }
};
exports.FiscalYearController = FiscalYearController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FiscalYearController.prototype, "status", null);
__decorate([
    (0, common_1.Post)('close'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FiscalYearController.prototype, "close", null);
exports.FiscalYearController = FiscalYearController = __decorate([
    (0, swagger_1.ApiTags)('FiscalYear'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('fiscal-year'),
    __metadata("design:paramtypes", [fiscal_year_service_1.FiscalYearService])
], FiscalYearController);
