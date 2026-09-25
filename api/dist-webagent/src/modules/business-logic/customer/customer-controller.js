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
exports.CustomerController = void 0;
const common_1 = require("@nestjs/common");
const customer_service_1 = require("./customer-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user-decorator");
const customer_dto_1 = require("./customer.dto");
let CustomerController = class CustomerController {
    constructor(customerService) {
        this.customerService = customerService;
    }
    async createCustomer(dto, userId) {
        return this.customerService.createCustomer(dto, userId);
    }
    async listCustomers(dto) {
        return this.customerService.listCustomers(dto);
    }
    async getCustomerSummary() {
        return this.customerService.getCustomerSummary();
    }
    async getTopCustomersByRevenue(dto) {
        return this.customerService.getTopCustomersByRevenue(dto);
    }
    async getCustomer(id) {
        return this.customerService.getCustomer(id);
    }
    async updateCustomer(id, dto, userId) {
        return this.customerService.updateCustomer(id, dto, userId);
    }
    async deleteCustomer(id, userId) {
        return this.customerService.deleteCustomer(id, userId);
    }
    async addReceivable(dto, userId) {
        return this.customerService.addReceivable(dto, userId);
    }
    async paymentReceivable(dto, userId) {
        return this.customerService.paymentReceivable(dto, userId);
    }
    async getCustomerReceivable(id) {
        return this.customerService.getCustomerReceivable(id);
    }
    async getCustomerStatement(id, dto) {
        return this.customerService.getCustomerStatement({ ...dto, CustomerId: id });
    }
    async adjustPoints(dto, userId) {
        return this.customerService.adjustPoints(dto, userId);
    }
    async getCustomerLoyaltyHistory(id) {
        return this.customerService.getCustomerLoyaltyHistory(id);
    }
    async createCustomerGroup(dto) {
        return this.customerService.createCustomerGroup(dto);
    }
    async listCustomerGroups() {
        return this.customerService.listCustomerGroups();
    }
    async updateCustomerGroup(id, dto) {
        return this.customerService.updateCustomerGroup(id, dto);
    }
    async deleteCustomerGroup(id) {
        return this.customerService.deleteCustomerGroup(id);
    }
};
exports.CustomerController = CustomerController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_dto_1.CreateCustomerDto, String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_dto_1.CustomerFilterDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "listCustomers", null);
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerSummary", null);
__decorate([
    (0, common_1.Get)('top-revenue'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_dto_1.CustomerTopDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getTopCustomersByRevenue", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomer", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, customer_dto_1.UpdateCustomerDto, String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateCustomer", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "deleteCustomer", null);
__decorate([
    (0, common_1.Post)('receivable/add'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_dto_1.AddReceivableDto, String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "addReceivable", null);
__decorate([
    (0, common_1.Post)('receivable/payment'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_dto_1.PaymentReceivableDto, String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "paymentReceivable", null);
__decorate([
    (0, common_1.Get)(':id/receivable'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerReceivable", null);
__decorate([
    (0, common_1.Get)(':id/statement'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, customer_dto_1.CustomerStatementDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerStatement", null);
__decorate([
    (0, common_1.Post)('points/adjust'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_dto_1.AdjustPointsDto, String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "adjustPoints", null);
__decorate([
    (0, common_1.Get)(':id/loyalty'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerLoyaltyHistory", null);
__decorate([
    (0, common_1.Post)('groups'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_dto_1.CreateCustomerGroupDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "createCustomerGroup", null);
__decorate([
    (0, common_1.Get)('groups'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "listCustomerGroups", null);
__decorate([
    (0, common_1.Put)('groups/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, customer_dto_1.UpdateCustomerGroupDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "updateCustomerGroup", null);
__decorate([
    (0, common_1.Delete)('groups/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "deleteCustomerGroup", null);
exports.CustomerController = CustomerController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/customers'),
    __metadata("design:paramtypes", [customer_service_1.CustomerService])
], CustomerController);
