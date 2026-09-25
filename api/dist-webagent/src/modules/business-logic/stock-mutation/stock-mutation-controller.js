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
exports.StockMutationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stock_mutation_service_1 = require("./stock-mutation-service");
const stock_mutation_dto_1 = require("./stock-mutation.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let StockMutationController = class StockMutationController {
    constructor(stockMutationService) {
        this.stockMutationService = stockMutationService;
    }
    async createMutationCategory(dto, req) {
        const data = await this.stockMutationService.createMutationCategory(dto, req.user?.id || '1');
        return api_response_dto_1.ApiResponse.ok(data, 'Mutation category created successfully');
    }
    async listMutationCategories(isActive) {
        const data = await this.stockMutationService.listMutationCategories(isActive === 'true' ? true : isActive === 'false' ? false : undefined);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getMutationCategory(id) {
        const data = await this.stockMutationService.getMutationCategory(parseInt(id));
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateMutationCategory(id, dto) {
        const data = await this.stockMutationService.updateMutationCategory(parseInt(id), dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Mutation category updated successfully');
    }
    async deleteMutationCategory(id) {
        const data = await this.stockMutationService.deleteMutationCategory(parseInt(id));
        return api_response_dto_1.ApiResponse.ok(data, 'Mutation category deleted successfully');
    }
    async createStockMutation(dto, req) {
        const data = await this.stockMutationService.createStockMutation(dto, req.user?.id || '1');
        return api_response_dto_1.ApiResponse.ok(data, 'Stock mutation created successfully');
    }
    async listStockMutations(dto) {
        const data = await this.stockMutationService.listStockMutations(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getStockMutation(id) {
        const data = await this.stockMutationService.getStockMutation(parseInt(id));
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateStockMutation(id, dto) {
        const data = await this.stockMutationService.updateStockMutation(parseInt(id), dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Stock mutation updated successfully');
    }
    async reverseStockMutation(id, reason, req) {
        const data = await this.stockMutationService.reverseStockMutation(parseInt(id), reason, req.user?.id || '1');
        return api_response_dto_1.ApiResponse.ok(data, 'Stock mutation reversed successfully');
    }
    async getMutationSummary(dto) {
        const data = await this.stockMutationService.getMutationSummary(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getMutationReport(dto) {
        const data = await this.stockMutationService.getMutationReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getProductMutationHistory(productId, startDate, endDate) {
        const data = await this.stockMutationService.getProductMutationHistory(parseInt(productId), startDate, endDate);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.StockMutationController = StockMutationController;
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create mutation category' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_mutation_dto_1.CreateMutationCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], StockMutationController.prototype, "createMutationCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List mutation categories' }),
    __param(0, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockMutationController.prototype, "listMutationCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get mutation category by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockMutationController.prototype, "getMutationCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update mutation category' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, stock_mutation_dto_1.UpdateMutationCategoryDto]),
    __metadata("design:returntype", Promise)
], StockMutationController.prototype, "updateMutationCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete mutation category' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockMutationController.prototype, "deleteMutationCategory", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create stock mutation' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_mutation_dto_1.CreateStockMutationDto, Object]),
    __metadata("design:returntype", Promise)
], StockMutationController.prototype, "createStockMutation", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List stock mutations' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_mutation_dto_1.StockMutationFilterDto]),
    __metadata("design:returntype", Promise)
], StockMutationController.prototype, "listStockMutations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock mutation by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockMutationController.prototype, "getStockMutation", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update stock mutation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, stock_mutation_dto_1.UpdateStockMutationDto]),
    __metadata("design:returntype", Promise)
], StockMutationController.prototype, "updateStockMutation", null);
__decorate([
    (0, common_1.Post)(':id/reverse'),
    (0, swagger_1.ApiOperation)({ summary: 'Reverse stock mutation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], StockMutationController.prototype, "reverseStockMutation", null);
__decorate([
    (0, common_1.Get)('report/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get mutation summary report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_mutation_dto_1.MutationSummaryDto]),
    __metadata("design:returntype", Promise)
], StockMutationController.prototype, "getMutationSummary", null);
__decorate([
    (0, common_1.Get)('report/by-category'),
    (0, swagger_1.ApiOperation)({ summary: 'Get mutation report by category' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_mutation_dto_1.MutationReportDto]),
    __metadata("design:returntype", Promise)
], StockMutationController.prototype, "getMutationReport", null);
__decorate([
    (0, common_1.Get)('product/:productId/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product mutation history' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StockMutationController.prototype, "getProductMutationHistory", null);
exports.StockMutationController = StockMutationController = __decorate([
    (0, swagger_1.ApiTags)('Stock Mutation - Mutasi Stok'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/stock-mutation'),
    __metadata("design:paramtypes", [stock_mutation_service_1.StockMutationService])
], StockMutationController);
