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
exports.ServiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
const number_1 = require("../../../common/utils/number");
let ServiceService = class ServiceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createService(dto, UserId) {
        const Code = await this.generateServiceCode();
        const intakeStatus = await this.prisma.repairStatus.findFirst({
            where: { Code: 'INTAKE' },
        });
        let subTotal = 0;
        if (dto.Items) {
            for (const item of dto.Items) {
                subTotal += (item.UnitPrice || 0) * item.Quantity;
            }
        }
        const laborCost = dto.LaborCost || 0;
        const TotalAmount = subTotal + laborCost;
        const service = await this.prisma.$transaction(async (tx) => {
            let CustomerId = dto.CustomerId;
            if (!CustomerId && dto.CustomerName) {
                const CustomerGroup = await tx.customerGroup.findFirst();
                const walkInCustomer = await tx.customer.findFirst({
                    where: { Name: 'Walk-in Customer' },
                });
                if (!walkInCustomer && CustomerGroup) {
                    const newCustomer = await tx.customer.create({
                        data: {
                            Code: 'WALKIN',
                            Name: 'Walk-in Customer',
                            CustomerGroupID: CustomerGroup.ID,
                        },
                    });
                    CustomerId = newCustomer.ID;
                }
                else if (walkInCustomer) {
                    CustomerId = walkInCustomer.ID;
                }
            }
            const newService = await tx.service.create({
                data: {
                    Code: Code,
                    Date: dto.Date ? new Date(dto.Date) : new Date(),
                    CustomerID: CustomerId || null,
                    CustomerName: dto.CustomerName,
                    CustomerPhone: dto.CustomerPhone,
                    CustomerAddress: dto.CustomerAddress,
                    ProductName: dto.ProductName,
                    SerialNumber: dto.SerialNumber,
                    Problem: dto.Problem,
                    Diagnosis: dto.Diagnosis,
                    Technician: dto.Technician,
                    WarrantyUntil: dto.WarrantyUntil ? new Date(dto.WarrantyUntil) : null,
                    LaborCost: new client_1.Prisma.Decimal(laborCost),
                    Subtotal: new client_1.Prisma.Decimal(subTotal),
                    TotalAmount: new client_1.Prisma.Decimal(TotalAmount),
                    RepairStatusID: intakeStatus?.ID || 1,
                    Notes: dto.Notes,
                },
            });
            if (dto.Items && dto.Items.length > 0) {
                await tx.serviceItem.createMany({
                    data: dto.Items.map((item) => ({
                        ServiceID: newService.ID,
                        ProductID: item.ProductId || null,
                        ProductName: item.ProductName,
                        Quantity: new client_1.Prisma.Decimal(item.Quantity),
                        UnitPrice: new client_1.Prisma.Decimal(item.UnitPrice || 0),
                        Subtotal: new client_1.Prisma.Decimal((item.UnitPrice || 0) * item.Quantity),
                    })),
                });
            }
            return newService;
        });
        return {
            success: true,
            service: {
                ID: service.ID,
                Code: service.Code,
                Date: service.Date,
                CustomerName: service.CustomerName,
                CustomerPhone: service.CustomerPhone,
                ProductName: service.ProductName,
                serialNumber: service.SerialNumber,
                problem: service.Problem,
                Status: intakeStatus?.Name || 'Intake',
                TotalAmount,
            },
        };
    }
    async getService(serviceId) {
        const service = await this.prisma.service.findUnique({
            where: { ID: serviceId },
            include: {
                Customer: true,
                Status: true,
                Items: { include: { Product: true } },
            },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        return {
            ID: service.ID,
            Code: service.Code,
            Date: service.Date,
            Customer: service.Customer,
            CustomerName: service.CustomerName,
            CustomerPhone: service.CustomerPhone,
            CustomerAddress: service.CustomerAddress,
            ProductName: service.ProductName,
            serialNumber: service.SerialNumber,
            problem: service.Problem,
            diagnosis: service.Diagnosis,
            technician: service.Technician,
            warrantyUntil: service.WarrantyUntil,
            subTotal: (0, number_1.number)(service.Subtotal),
            laborCost: (0, number_1.number)(service.LaborCost),
            TotalAmount: (0, number_1.number)(service.TotalAmount),
            Status: service.Status,
            Notes: service.Notes,
            items: service.Items.map((item) => ({
                ID: item.ID,
                ProductId: item.ProductID,
                ProductName: item.ProductName,
                ProductCode: item.Product?.Code,
                Quantity: (0, number_1.number)(item.Quantity),
                UnitPrice: (0, number_1.number)(item.UnitPrice),
                subTotal: (0, number_1.number)(item.Subtotal),
            })),
        };
    }
    async listServices(dto) {
        const where = {};
        if (dto.CustomerId) {
            where.CustomerID = dto.CustomerId;
        }
        if (dto.StatusId) {
            where.RepairStatusID = dto.StatusId;
        }
        if (dto.Technician) {
            where.Technician = dto.Technician;
        }
        if (dto.PendingOnly) {
            where.Status = { IsTerminal: false };
        }
        if (dto.StartDate || dto.EndDate) {
            where.Date = {};
            if (dto.StartDate) {
                where.Date.gte = new Date(dto.StartDate);
            }
            if (dto.EndDate) {
                where.Date.lte = new Date(dto.EndDate);
            }
        }
        const services = await this.prisma.service.findMany({
            where,
            include: {
                Customer: true,
                Status: true,
                Items: true,
            },
            orderBy: { Date: 'desc' },
        });
        return services.map((s) => ({
            ID: s.ID,
            Code: s.Code,
            Date: s.Date,
            CustomerName: s.CustomerName,
            CustomerPhone: s.CustomerPhone,
            ProductName: s.ProductName,
            serialNumber: s.SerialNumber,
            problem: s.Problem,
            technician: s.Technician,
            TotalAmount: (0, number_1.number)(s.TotalAmount),
            Status: s.Status.Name,
            StatusColor: s.Status.Color,
            itemCount: s.Items.length,
        }));
    }
    async updateServiceStatus(serviceId, dto, UserId) {
        const service = await this.prisma.service.findUnique({
            where: { ID: serviceId },
            include: { Status: true },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const newStatus = await this.prisma.repairStatus.findUnique({
            where: { ID: dto.StatusId },
        });
        if (!newStatus) {
            throw new common_1.NotFoundException('Status not found');
        }
        await this.prisma.service.update({
            where: { ID: serviceId },
            data: {
                RepairStatusID: dto.StatusId,
                Diagnosis: dto.Diagnosis || service.Diagnosis,
                Technician: dto.Technician || service.Technician,
                Notes: dto.Notes || service.Notes,
            },
        });
        return {
            success: true,
            serviceId,
            Code: service.Code,
            previousStatus: service.Status.Name,
            newStatus: newStatus.Name,
        };
    }
    async addServiceItem(serviceId, dto, UserId) {
        const service = await this.prisma.service.findUnique({
            where: { ID: serviceId },
            include: { Status: true },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        if (service.Status.IsTerminal) {
            throw new common_1.BadRequestException('Cannot add items to completed service');
        }
        const subTotal = dto.UnitPrice * dto.Quantity;
        await this.prisma.$transaction(async (tx) => {
            await tx.serviceItem.create({
                data: {
                    ServiceID: serviceId,
                    ProductID: dto.ProductId || null,
                    ProductName: dto.ProductName,
                    Quantity: new client_1.Prisma.Decimal(dto.Quantity),
                    UnitPrice: new client_1.Prisma.Decimal(dto.UnitPrice),
                    Subtotal: new client_1.Prisma.Decimal(subTotal),
                },
            });
            const currentSubTotal = Number(service.Subtotal) + subTotal;
            const newTotal = currentSubTotal + Number(service.LaborCost);
            await tx.service.update({
                where: { ID: serviceId },
                data: {
                    Subtotal: new client_1.Prisma.Decimal(currentSubTotal),
                    TotalAmount: new client_1.Prisma.Decimal(newTotal),
                },
            });
            if (dto.ProductId) {
                await tx.product.update({
                    where: { ID: dto.ProductId },
                    data: { Stock: { decrement: new client_1.Prisma.Decimal(dto.Quantity) } },
                });
            }
        });
        return {
            success: true,
            serviceId,
            addedItem: {
                ProductName: dto.ProductName,
                Quantity: dto.Quantity,
                UnitPrice: dto.UnitPrice,
                subTotal,
            },
        };
    }
    async completeService(serviceId, dto, UserId) {
        const service = await this.prisma.service.findUnique({
            where: { ID: serviceId },
            include: { Status: true },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        if (service.Status.IsTerminal) {
            throw new common_1.BadRequestException('Service already completed');
        }
        const completedStatus = await this.prisma.repairStatus.findFirst({
            where: { Code: 'COMPLETED' },
        });
        const finalSubTotal = Number(service.Subtotal);
        const finalLaborCost = dto.LaborCost;
        const finalTotal = dto.TotalAmount || finalSubTotal + finalLaborCost;
        await this.prisma.service.update({
            where: { ID: serviceId },
            data: {
                RepairStatusID: completedStatus?.ID || 2,
                Diagnosis: dto.Diagnosis,
                LaborCost: new client_1.Prisma.Decimal(finalLaborCost),
                TotalAmount: new client_1.Prisma.Decimal(finalTotal),
                Notes: dto.Notes || service.Notes,
            },
        });
        return {
            success: true,
            serviceId,
            Code: service.Code,
            subTotal: finalSubTotal,
            laborCost: finalLaborCost,
            TotalAmount: finalTotal,
            Status: completedStatus?.Name || 'Completed',
        };
    }
    async recordPayment(serviceId, dto, UserId) {
        const service = await this.prisma.service.findUnique({
            where: { ID: serviceId },
            include: { Status: true },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        if (!service.Status.IsTerminal) {
            throw new common_1.BadRequestException('Service must be completed before Payment');
        }
        return {
            success: true,
            serviceId,
            Code: service.Code,
            TotalAmount: (0, number_1.number)(service.TotalAmount),
            PaymentAmount: dto.Amount,
            PaymentMethodId: dto.PaymentMethodId,
            referenceNumber: dto.ReferenceNumber,
            message: 'Payment Recorded (integration with Payment system pending)',
        };
    }
    async getServiceStats(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.Date = {};
            if (startDate) {
                where.Date.gte = new Date(startDate);
            }
            if (endDate) {
                where.Date.lte = new Date(endDate);
            }
        }
        const services = await this.prisma.service.findMany({
            where,
            include: { Status: true },
        });
        const stats = {
            TotalServices: services.length,
            TotalRevenue: services.reduce((sum, s) => sum + Number(s.TotalAmount), 0),
            byStatus: {},
        };
        for (const service of services) {
            const StatusName = service.Status.Name;
            if (!stats.byStatus[StatusName]) {
                stats.byStatus[StatusName] = { Count: 0, revenue: 0 };
            }
            stats.byStatus[StatusName].Count++;
            if (service.Status.IsTerminal) {
                stats.byStatus[StatusName].revenue += Number(service.TotalAmount);
            }
        }
        return stats;
    }
    async generateServiceCode() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const prefix = `SRV-${year}${month}`;
        const lastService = await this.prisma.service.findFirst({
            where: { Code: { startsWith: prefix } },
            orderBy: { Code: 'desc' },
            select: { Code: true },
        });
        let nextNumber = 1;
        if (lastService) {
            const lastSeq = parseInt(lastService.Code.split('-').pop() || '0', 10);
            nextNumber = lastSeq + 1;
        }
        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    }
};
exports.ServiceService = ServiceService;
exports.ServiceService = ServiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceService);
