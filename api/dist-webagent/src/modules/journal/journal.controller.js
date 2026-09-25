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
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const base_controller_1 = require("../../common/templates/base.controller");
const journal_service_1 = require("./journal.service");
const journal_dto_1 = require("./dto/journal.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
let JournalController = class JournalController extends base_controller_1.BaseController {
    constructor(journalService) {
        super(journalService, {
            modelName: 'Journal',
            pluralName: 'Journals',
            primaryKeyType: 'number',
            paramId: 'id',
            routePrefix: 'journal',
        });
        this.journalService = journalService;
    }
    async findAll(query) {
        return super.findAll(query);
    }
    async getCount(query) {
        return super.getCount(query);
    }
    async findById(id, query) {
        return super.findById(id, query);
    }
    async findByField(field, value, query) {
        return super.findByField(field, value, query);
    }
    async create(dto, user) {
        const data = await this.journalService.createJournal(dto, user.id);
        return { success: true, data, message: 'Journal created successfully' };
    }
    async patchById(id, dto, user) {
        const data = await this.journalService.updateJournal(Number(id), dto, user.id);
        return { success: true, data, message: 'Journal updated successfully' };
    }
    async deleteById(id) {
        const data = await this.journalService.deleteJournal(Number(id));
        return { success: true, data, message: 'Journal deleted successfully' };
    }
};
exports.JournalController = JournalController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all Journals with OData query support' }),
    (0, swagger_1.ApiQuery)({ name: '$select', required: false, description: 'Select fields' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations: ' }),
    (0, swagger_1.ApiQuery)({ name: '$where[field]', required: false, description: 'Filter by field' }),
    (0, swagger_1.ApiQuery)({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' }),
    (0, swagger_1.ApiQuery)({ name: '$skip', required: false, type: Number, description: 'Offset' }),
    (0, swagger_1.ApiQuery)({ name: '$take', required: false, type: Number, description: 'Limit' }),
    (0, swagger_1.ApiQuery)({ name: '$search', required: false, description: 'Search: name' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get count of Journals' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "getCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Journal by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('by/:field/:value'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Journal by field reference' }),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "findByField", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new Journal' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [journal_dto_1.CreateJournalDto, Object]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Journal by ID (pass `entries` to replace all debit/credit lines atomically)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "patchById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete Journal by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JournalController.prototype, "deleteById", null);
exports.JournalController = JournalController = __decorate([
    (0, swagger_1.ApiTags)('Journal'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('journal'),
    __metadata("design:paramtypes", [journal_service_1.JournalService])
], JournalController);
