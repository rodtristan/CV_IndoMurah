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
exports.ProductionRecipeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const production_recipe_service_1 = require("./production-recipe-service");
const production_recipe_dto_1 = require("./production-recipe.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let ProductionRecipeController = class ProductionRecipeController {
    constructor(recipeService) {
        this.recipeService = recipeService;
    }
    async createRecipe(dto) {
        const userId = 'system';
        const data = await this.recipeService.createRecipe(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Recipe saved successfully');
    }
    async getRecipeByProduct(productId) {
        const data = await this.recipeService.getRecipeByProduct(productId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async listRecipes(dto) {
        const data = await this.recipeService.listRecipes(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async calculateRecipe(dto) {
        const data = await this.recipeService.calculateRecipe(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async deleteRecipe(id) {
        const data = await this.recipeService.deleteRecipe(id);
        return api_response_dto_1.ApiResponse.ok(data, 'Recipe deleted successfully');
    }
};
exports.ProductionRecipeController = ProductionRecipeController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update production recipe' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [production_recipe_dto_1.CreateRecipeDto]),
    __metadata("design:returntype", Promise)
], ProductionRecipeController.prototype, "createRecipe", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recipe by product ID' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductionRecipeController.prototype, "getRecipeByProduct", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List recipes' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [production_recipe_dto_1.RecipeFilterDto]),
    __metadata("design:returntype", Promise)
], ProductionRecipeController.prototype, "listRecipes", null);
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate recipe cost for production' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [production_recipe_dto_1.CalculateRecipeDto]),
    __metadata("design:returntype", Promise)
], ProductionRecipeController.prototype, "calculateRecipe", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete recipe' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductionRecipeController.prototype, "deleteRecipe", null);
exports.ProductionRecipeController = ProductionRecipeController = __decorate([
    (0, swagger_1.ApiTags)('Business Logic - Production Recipe'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/production-recipe'),
    __metadata("design:paramtypes", [production_recipe_service_1.ProductionRecipeService])
], ProductionRecipeController);
