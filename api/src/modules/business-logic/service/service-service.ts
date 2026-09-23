import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client'
import { number } from '../../../common/utils/number';
import {
  CreateServiceDto,
  UpDateServiceStatusDto,
  AddServiceItemDto,
  CompleteServiceDto,
  ServiceFilterDto,
  RecordServicePaymentDto,
} from './service.dto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // SERVICE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new service Order
   * Flow: Pelanggan bawa barang rusak → CS buat service Order → teknisi kerja → selesai
   */
  async createService(dto: CreateServiceDto, UserId: string) {
    // generate service Code
    const Code = await this.generateServiceCode();

    // Get intake Status
    const intakeStatus = await this.prisma.repairStatus.findFirst({
      where: { Code: 'INTAKE' },
    });

    // Calculate initial subTotal from items
    let subTotal = 0;
    if (dto.Items) {
      for (const item of dto.Items) {
        subTotal += (item.UnitPrice || 0) * item.Quantity;
      }
    }

    const laborCost = dto.laborCost || 0;
    const TotalAmount = subTotal + laborCost;

    const service = await this.prisma.$transaction(async (tx) => {
      // Create Customer if not exists
      let CustomerId = dto.CustomerId;
      if (!CustomerId && dto.CustomerName) {
        // Find or create walk-in Customer
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
        } else if (walkInCustomer) {
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
          SerialNumber: dto.serialNumber,
          Problem: dto.problem,
          Diagnosis: dto.diagnosis,
          Technician: dto.technician,
          WarrantyUntil: dto.warrantyUntil ? new Date(dto.warrantyUntil) : null,
          LaborCost: new Prisma.Decimal(laborCost),
          SubTotal: new Prisma.Decimal(subTotal),
          TotalAmount: new Prisma.Decimal(TotalAmount),
          RepairStatusID: intakeStatus?.ID || 1,
          Notes: dto.Notes,
        },
      });

      // Create service items
      if (dto.Items && dto.Items.length > 0) {
        await tx.serviceItem.createMany({
          data: dto.Items.map((item) => ({
            ServiceID: newService.ID,
            ProductID: item.ProductId || null,
            ProductName: item.ProductName,
            Quantity: new Prisma.Decimal(item.Quantity),
            UnitPrice: new Prisma.Decimal(item.UnitPrice || 0),
            SubTotal: new Prisma.Decimal((item.UnitPrice || 0) * item.Quantity),
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

  /**
   * Get service by ID
   */
  async getService(serviceId: number) {
    const service = await this.prisma.service.findUnique({
      where: { ID: serviceId },
      include: {
        Customer: true,
        Status: true,
        Items: { include: { Product: true } },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
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
      subTotal: number(service.SubTotal),
      laborCost: number(service.LaborCost),
      TotalAmount: number(service.TotalAmount),
      Status: service.Status,
      Notes: service.Notes,
      items: service.Items.map((item) => ({
        ID: item.ID,
        ProductId: item.ProductID,
        ProductName: item.ProductName,
        ProductCode: item.Product?.Code,
        Quantity: number(item.Quantity),
        UnitPrice: number(item.UnitPrice),
        subTotal: number(item.SubTotal),
      })),
    };
  }

  /**
   * List services
   */
  async listServices(dto: ServiceFilterDto) {
    const where: any = {};

    if (dto.CustomerId) {
      where.CustomerID = dto.CustomerId;
    }

    if (dto.StatusId) {
      where.RepairStatusID = dto.StatusId;
    }

    if (dto.technician) {
      where.Technician = dto.technician;
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
      TotalAmount: number(s.TotalAmount),
      Status: s.Status.Name,
      StatusColor: s.Status.Color,
      itemCount: s.Items.length,
    }));
  }

  /**
   * UpDate service Status
   * Flow: Teknisi update Status → diagnostic → selesai
   */
  async updateServiceStatus(serviceId: number, dto: UpDateServiceStatusDto, UserId: string) {
    const service = await this.prisma.service.findUnique({
      where: { ID: serviceId },
      include: { Status: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const newStatus = await this.prisma.repairStatus.findUnique({
      where: { ID: dto.StatusId },
    });

    if (!newStatus) {
      throw new NotFoundException('Status not found');
    }

    await this.prisma.service.update({
      where: { ID: serviceId },
      data: {
        RepairStatusID: dto.StatusId,
        Diagnosis: dto.diagnosis || service.Diagnosis,
        Technician: dto.technician || service.Technician,
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

  /**
   * Add item to service
   */
  async addServiceItem(serviceId: number, dto: AddServiceItemDto, UserId: string) {
    const service = await this.prisma.service.findUnique({
      where: { ID: serviceId },
      include: { Status: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.Status.IsTerminal) {
      throw new BadRequestException('Cannot add items to completed service');
    }

    const subTotal = dto.UnitPrice * dto.Quantity;

    await this.prisma.$transaction(async (tx) => {
      // Create service item
      await tx.serviceItem.create({
        data: {
          ServiceID: serviceId,
          ProductID: dto.ProductId || null,
          ProductName: dto.ProductName,
          Quantity: new Prisma.Decimal(dto.Quantity),
          UnitPrice: new Prisma.Decimal(dto.UnitPrice),
          SubTotal: new Prisma.Decimal(subTotal),
        },
      });

      // UpDate service Totals
      const currentSubTotal = Number(service.SubTotal) + subTotal;
      const newTotal = currentSubTotal + Number(service.LaborCost);

      await tx.service.update({
        where: { ID: serviceId },
        data: {
          SubTotal: new Prisma.Decimal(currentSubTotal),
          TotalAmount: new Prisma.Decimal(newTotal),
        },
      });

      // Decrease Stock if using inventory Product
      if (dto.ProductId) {
        await tx.product.update({
          where: { ID: dto.ProductId },
          data: { Stock: { decrement: new Prisma.Decimal(dto.Quantity) } },
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

  /**
   * Complete service
   * Flow: Teknisi selesai → hitung Total → pelanggan bayar
   */
  async completeService(serviceId: number, dto: CompleteServiceDto, UserId: string) {
    const service = await this.prisma.service.findUnique({
      where: { ID: serviceId },
      include: { Status: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.Status.IsTerminal) {
      throw new BadRequestException('Service already completed');
    }

    // Get completed Status
    const completedStatus = await this.prisma.repairStatus.findFirst({
      where: { Code: 'COMPLETED' },
    });

    const finalSubTotal = Number(service.SubTotal);
    const finalLaborCost = dto.laborCost;
    const finalTotal = dto.TotalAmount || finalSubTotal + finalLaborCost;

    await this.prisma.service.update({
      where: { ID: serviceId },
      data: {
        RepairStatusID: completedStatus?.ID || 2,
        Diagnosis: dto.diagnosis,
        LaborCost: new Prisma.Decimal(finalLaborCost),
        TotalAmount: new Prisma.Decimal(finalTotal),
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

  /**
   * Record service Payment
   */
  async RecordPayment(serviceId: number, dto: RecordServicePaymentDto, UserId: string) {
    const service = await this.prisma.service.findUnique({
      where: { ID: serviceId },
      include: { Status: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (!service.Status.IsTerminal) {
      throw new BadRequestException('Service must be completed before Payment');
    }

    // For now, just Record the Payment - in a full implementation,
    // this would integRate with the Cash/Payment system
    return {
      success: true,
      serviceId,
      Code: service.Code,
      TotalAmount: number(service.TotalAmount),
      PaymentAmount: dto.Amount,
      PaymentMethodId: dto.PaymentMethodId,
      referenceNumber: dto.ReferenceNumber,
      message: 'Payment Recorded (integration with Payment system pending)',
    };
  }

  /**
   * Get service statistics
   */
  async getServiceStats(startDate?: string, endDate?: string) {
    const where: any = {};

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
      byStatus: {} as Record<string, { Count: number; revenue: number }>,
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

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async generateServiceCode(): Promise<string> {
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
}
