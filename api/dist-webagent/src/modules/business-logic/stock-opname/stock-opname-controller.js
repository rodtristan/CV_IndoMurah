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
exports.StockOpnameController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stock_opname_service_1 = require("./stock-opname-service");
const stock_opname_dto_1 = require("./stock-opname.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let StockOpnameController = class StockOpnameController {
    constructor(stockOpnameService) {
        this.stockOpnameService = stockOpnameService;
    }
    async generateOpnameList(dto) {
        const data = await this.stockOpnameService.generateOpnameList(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async create(dto) {
        const data = await this.stockOpnameService.create(dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Stock opname created successfully');
    }
    async findAll(dto) {
        const data = await this.stockOpnameService.findAll(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async findById(id) {
        const data = await this.stockOpnameService.findById(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async update(id, dto) {
        const data = await this.stockOpnameService.update(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Stock opname updated');
    }
    async approve(id, dto) {
        const data = await this.stockOpnameService.approve(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Stock opname approved');
    }
    async cancel(id, dto) {
        const data = await this.stockOpnameService.cancel(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Stock opname cancelled');
    }
    async delete(id) {
        await this.stockOpnameService.delete(id);
        return api_response_dto_1.ApiResponse.ok(null, 'Stock opname deleted');
    }
};
exports.StockOpnameController = StockOpnameController;
__decorate([
    (0, common_1.Get)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate stock opname list with current system stock' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_opname_dto_1.GenerateOpnameListDto]),
    __metadata("design:returntype", Promise)
], StockOpnameController.prototype, "generateOpnameList", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new stock opname' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_opname_dto_1.CreateStockOpnameDto]),
    __metadata("design:returntype", Promise)
], StockOpnameController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all stock opnames' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_opname_dto_1.StockOpnameQueryDto]),
    __metadata("design:returntype", Promise)
], StockOpnameController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock opname by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StockOpnameController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update stock opname' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, stock_opname_dto_1.UpdateStockOpnameDto]),
    __metadata("design:returntype", Promise)
], StockOpnameController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve stock opname (with optional stock adjustment)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, stock_opname_dto_1.ApproveStockOpnameDto]),
    __metadata("design:returntype", Promise)
], StockOpnameController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel stock opname' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, stock_opname_dto_1.CancelStockOpnameDto]),
    __metadata("design:returntype", Promise)
], StockOpnameController.prototype, "cancel", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete draft stock opname' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StockOpnameController.prototype, "delete", null);
exports.StockOpnameController = StockOpnameController = __decorate([
    (0, swagger_1.ApiTags)('Stock Opname - Stock Taking'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/stock-opname'),
    __metadata("design:paramtypes", [stock_opname_service_1.StockOpnameService])
], StockOpnameController);
