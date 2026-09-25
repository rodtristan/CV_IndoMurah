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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkStationFilterDto = exports.CreateWorkStationDto = exports.MaterialAllocationItemDto = exports.MaterialAllocationDto = exports.RecordProgressDto = exports.WorkOrderSchedulingDto = exports.ScheduleResourceDto = exports.ScheduleWorkOrderDto = exports.WorkOrderFilterDto = exports.UpdateWorkOrderDto = exports.CreateWorkOrderDto = exports.WorkOrderItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class WorkOrderItemDto {
}
exports.WorkOrderItemDto = WorkOrderItemDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkOrderItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkOrderItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkOrderItemDto.prototype, "UnitId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkOrderItemDto.prototype, "BOMId", void 0);
class CreateWorkOrderDto {
}
exports.CreateWorkOrderDto = CreateWorkOrderDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "WorkOrderDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "DueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWorkOrderDto.prototype, "ProductionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWorkOrderDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWorkOrderDto.prototype, "AssignedToId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkOrderItemDto),
    __metadata("design:type", Array)
], CreateWorkOrderDto.prototype, "Items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "Priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "Notes", void 0);
class UpdateWorkOrderDto {
}
exports.UpdateWorkOrderDto = UpdateWorkOrderDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "DueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateWorkOrderDto.prototype, "AssignedToId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "Priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "Notes", void 0);
class WorkOrderFilterDto {
}
exports.WorkOrderFilterDto = WorkOrderFilterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], WorkOrderFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], WorkOrderFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkOrderFilterDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkOrderFilterDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkOrderFilterDto.prototype, "AssignedToId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkOrderFilterDto.prototype, "Priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WorkOrderFilterDto.prototype, "OverdueOnly", void 0);
class ScheduleWorkOrderDto {
}
exports.ScheduleWorkOrderDto = ScheduleWorkOrderDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ScheduleWorkOrderDto.prototype, "workOrderId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ScheduleWorkOrderDto.prototype, "scheduledStartDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ScheduleWorkOrderDto.prototype, "scheduledEndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ScheduleResourceDto),
    __metadata("design:type", Array)
], ScheduleWorkOrderDto.prototype, "resources", void 0);
class ScheduleResourceDto {
}
exports.ScheduleResourceDto = ScheduleResourceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleResourceDto.prototype, "resourceType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ScheduleResourceDto.prototype, "resourceId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ScheduleResourceDto.prototype, "AllocatedHours", void 0);
class WorkOrderSchedulingDto {
}
exports.WorkOrderSchedulingDto = WorkOrderSchedulingDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], WorkOrderSchedulingDto.prototype, "StartDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], WorkOrderSchedulingDto.prototype, "EndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkOrderSchedulingDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkOrderSchedulingDto.prototype, "workStationId", void 0);
class RecordProgressDto {
}
exports.RecordProgressDto = RecordProgressDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordProgressDto.prototype, "workOrderId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordProgressDto.prototype, "CompletedQuantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordProgressDto.prototype, "Notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordProgressDto.prototype, "workStationId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordProgressDto.prototype, "EmployeeId", void 0);
class MaterialAllocationDto {
}
exports.MaterialAllocationDto = MaterialAllocationDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MaterialAllocationDto.prototype, "workOrderId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MaterialAllocationItemDto),
    __metadata("design:type", Array)
], MaterialAllocationDto.prototype, "allocations", void 0);
class MaterialAllocationItemDto {
}
exports.MaterialAllocationItemDto = MaterialAllocationItemDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MaterialAllocationItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MaterialAllocationItemDto.prototype, "AllocatedQuantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MaterialAllocationItemDto.prototype, "Notes", void 0);
class CreateWorkStationDto {
}
exports.CreateWorkStationDto = CreateWorkStationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkStationDto.prototype, "Name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkStationDto.prototype, "Code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkStationDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWorkStationDto.prototype, "capacity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWorkStationDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateWorkStationDto.prototype, "capabilities", void 0);
class WorkStationFilterDto {
}
exports.WorkStationFilterDto = WorkStationFilterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WorkStationFilterDto.prototype, "IsActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkStationFilterDto.prototype, "WarehouseId", void 0);
