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
exports.SalesPersonController = void 0;
const common_1 = require("@nestjs/common");
const salesperson_service_1 = require("./salesperson-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user-decorator");
const salesperson_dto_1 = require("./salesperson.dto");
let SalesPersonController = class SalesPersonController {
    constructor(salesPersonService) {
        this.salesPersonService = salesPersonService;
    }
    async createSalesPerson(dto, userId) {
        return this.salesPersonService.createSalesPerson(dto, userId);
    }
    async listSalesPersons(dto) {
        return this.salesPersonService.listSalesPersons(dto);
    }
    async getSalesPersonPerformance(dto) {
        return this.salesPersonService.getSalesPersonPerformance(dto);
    }
    async getSalesPerson(id) {
        return this.salesPersonService.getSalesPerson(id);
    }
    async updateSalesPerson(id, dto, userId) {
        return this.salesPersonService.updateSalesPerson(id, dto, userId);
    }
    async deleteSalesPerson(id) {
        return this.salesPersonService.deleteSalesPerson(id);
    }
};
exports.SalesPersonController = SalesPersonController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [salesperson_dto_1.CreateSalesPersonDto, String]),
    __metadata("design:returntype", Promise)
], SalesPersonController.prototype, "createSalesPerson", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [salesperson_dto_1.SalesPersonFilterDto]),
    __metadata("design:returntype", Promise)
], SalesPersonController.prototype, "listSalesPersons", null);
__decorate([
    (0, common_1.Get)('performance'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [salesperson_dto_1.SalesPersonPerformanceDto]),
    __metadata("design:returntype", Promise)
], SalesPersonController.prototype, "getSalesPersonPerformance", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SalesPersonController.prototype, "getSalesPerson", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, salesperson_dto_1.UpDateSalesPersonDto, String]),
    __metadata("design:returntype", Promise)
], SalesPersonController.prototype, "updateSalesPerson", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SalesPersonController.prototype, "deleteSalesPerson", null);
exports.SalesPersonController = SalesPersonController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/salespersons'),
    __metadata("design:paramtypes", [salesperson_service_1.SalesPersonService])
], SalesPersonController);
