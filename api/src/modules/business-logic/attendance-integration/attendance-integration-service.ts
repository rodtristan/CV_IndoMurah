import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client';
import {
  DeviceConfigDto,
  UpdateDeviceConfigDto,
  SyncAttendanceDto,
  AttendanceRecordDto,
  DeviceFilterDto,
  EmployeeMappingDto,
  BulkEmployeeMappingDto,
  DeviceLogDto,
  DeviceCommandDto,
  ScheduleDto,
  AssignScheduleDto,
} from './attendance-integration.dto';

@Injectable()
export class AttendanceIntegrationService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // DEVICE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Register new attendance device
   */
  async registerDevice(dto: DeviceConfigDto, userId: string) {
    // Check for duplicate host
    const existing = await this.prisma.attendanceDevice.findFirst({
      where: { Host: dto.Host, Port: dto.Port },
    });

    if (existing) {
      throw new BadRequestException('Device with this host and port already exists');
    }

    // generate device Code
    const code = await this.generateDeviceCode();

    // Get Active Status
    const activeStatus = await this.prisma.attendanceDeviceStatus.findFirst({
      where: { Code: 'ACTIVE' },
    });

    const device = await this.prisma.attendanceDevice.create({
      data: {
        Code: code,
        Name: dto.Name,
        Host: dto.Host,
        Port: dto.Port,
        CommKey: dto.CommKey,
        DeviceType: dto.DeviceType || 'FINGERPRINT',
        Location: dto.Location,
        Notes: dto.Notes,
        StatusID: activeStatus?.ID || 1,
      },
    });

    return {
      Success: true,
      Device: this.formatDevice(device),
    };
  }

  /**
   * Get device by ID
   */
  async getDevice(deviceId: number) {
    const device = await this.prisma.attendanceDevice.findUnique({
      where: { ID: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return this.formatDevice(device);
  }

  /**
   * List all devices
   */
  async listDevices(dto: DeviceFilterDto) {
    const where: any = {};

    if (dto.ActiveOnly !== 'false') {
      where.IsActive = true;
    }

    if (dto.DeviceType) {
      where.DeviceType = dto.DeviceType;
    }

    if (dto.Location) {
      where.Location = { contains: dto.Location, mode: 'insensitive' };
    }

    const devices = await this.prisma.attendanceDevice.findMany({
      where,
      orderBy: { Name: 'asc' },
    });

    return devices.map((d) => this.formatDevice(d));
  }

  /**
   * Update device configuration
   */
  async updateDevice(deviceId: number, dto: UpdateDeviceConfigDto, userId: string) {
    const device = await this.prisma.attendanceDevice.findUnique({
      where: { ID: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const updateData: any = {};

    if (dto.Name) updateData.Name = dto.Name;
    if (dto.Host) updateData.Host = dto.Host;
    if (dto.Port) updateData.Port = dto.Port;
    if (dto.CommKey) updateData.CommKey = dto.CommKey;
    if (dto.Location) updateData.Location = dto.Location;
    if (dto.IsActive !== undefined) updateData.IsActive = dto.IsActive === 'true';

    const updated = await this.prisma.attendanceDevice.update({
      where: { ID: deviceId },
      data: updateData,
    });

    return {
      Success: true,
      Device: this.formatDevice(updated),
    };
  }

  /**
   * Delete device (soft delete)
   */
  async deleteDevice(deviceId: number, userId: string) {
    const device = await this.prisma.attendanceDevice.findUnique({
      where: { ID: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    await this.prisma.attendanceDevice.update({
      where: { ID: deviceId },
      data: { IsActive: false },
    });

    return {
      Success: true,
      Message: 'Device deleted successfully',
    };
  }

  /**
   * Test device connection
   */
  async testConnection(deviceId: number) {
    const device = await this.prisma.attendanceDevice.findUnique({
      where: { ID: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // In real implementation, this would connect to the actual device
    // For now, we simulate the connection test
    const isConnected = await this.simulateConnection(device);

    return {
      DeviceId: deviceId,
      DeviceName: device.Name,
      Host: device.Host,
      Port: device.Port,
      IsConnected: isConnected,
      Message: isConnected ? 'Device connected successfully' : 'Failed to connect to device',
      TestedAt: new Date().toISOString(),
    };
  }

  /**
   * Execute device command
   */
  async executeCommand(deviceId: number, dto: DeviceCommandDto, userId: string) {
    const device = await this.prisma.attendanceDevice.findUnique({
      where: { ID: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Log the command
    await this.logDeviceCommand(deviceId, dto.Command, dto.UserId, userId);

    // In real implementation, this would send command to actual device
    return {
      Success: true,
      DeviceId: deviceId,
      Command: dto.Command,
      ExecutedAt: new Date().toISOString(),
      Message: `Command ${dto.Command} executed successfully`,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EMPLOYEE MAPPING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Map Employee to device
   */
  async mapEmployee(dto: EmployeeMappingDto, userId: string) {
    // Validate Employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { ID: dto.EmployeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if mapping already exists
    const existing = await this.prisma.employeeDeviceMapping.findFirst({
      where: {
        OR: [
          { EmployeeID: dto.EmployeeId },
          { DeviceCode: dto.DeviceCode },
        ],
      },
    });

    if (existing) {
      // UpDate existing mapping
      const updated = await this.prisma.employeeDeviceMapping.update({
        where: { ID: existing.ID },
        data: {
          DeviceCode: dto.DeviceCode,
          FingerprintTemplate: dto.FingerprintTemplate,
          FaceTemplate: dto.FaceTemplate,
        },
      });

      return {
        Success: true,
        Mapping: this.formatMapping(updated),
        Action: 'updated',
      };
    }

    // Create new mapping
    const mapping = await this.prisma.employeeDeviceMapping.create({
      data: {
        EmployeeID: dto.EmployeeId,
        DeviceCode: dto.DeviceCode,
        FingerprintTemplate: dto.FingerprintTemplate,
        FaceTemplate: dto.FaceTemplate,
      },
      include: { Employee: true },
    });

    return {
      Success: true,
      Mapping: this.formatMapping(mapping),
      Action: 'created',
    };
  }

  /**
   * Bulk map Employees to device
   */
  async bulkMapEmployees(dto: BulkEmployeeMappingDto, userId: string) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const mapping of dto.Mappings) {
      try {
        await this.mapEmployee(mapping, userId);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Employee ${mapping.EmployeeId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      Success: true,
      Total: dto.Mappings.length,
      Succeeded: results.success,
      Failed: results.failed,
      Errors: results.errors,
    };
  }

  /**
   * Get Employee device mappings
   */
  async getMappings(employeeId?: number) {
    const where: any = {};
    if (employeeId) where.EmployeeID = employeeId;

    const mappings = await this.prisma.employeeDeviceMapping.findMany({
      where,
      include: { Employee: { include: { Department: true } } },
    });

    return mappings.map((m) => ({
      ...this.formatMapping(m),
      EmployeeName: m.Employee?.Name,
      EmployeeCode: m.Employee?.Code,
      Department: m.Employee?.Department?.Name,
    }));
  }

  /**
   * Delete Employee mapping
   */
  async deleteMapping(employeeId: number, userId: string) {
    const mapping = await this.prisma.employeeDeviceMapping.findFirst({
      where: { EmployeeID: employeeId },
    });

    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }

    await this.prisma.employeeDeviceMapping.delete({
      where: { ID: mapping.ID },
    });

    return {
      Success: true,
      Message: 'Mapping deleted successfully',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ATTENDANCE SYNC
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Sync attendance Records from device
   * Flow: Device kirim data → sistem proses → simpan ke database
   */
  async syncAttendance(dto: SyncAttendanceDto, userId: string) {
    const device = await this.prisma.attendanceDevice.findUnique({
      where: { ID: dto.DeviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const results = {
      Success: 0,
      Failed: 0,
      Skipped: 0,
      Errors: [] as string[],
    };

    for (const record of dto.Records) {
      try {
        const result = await this.processAttendanceRecord(record, device.ID, userId);
        if (result.Action === 'created') {
          results.Success++;
        } else {
          results.Skipped++;
        }
      } catch (error) {
        results.Failed++;
        results.Errors.push(`${record.EmployeeCode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // UpDate device last sync time
    await this.prisma.attendanceDevice.update({
      where: { ID: dto.DeviceId },
      data: { LastSyncAt: new Date() },
    });

    return {
      DeviceId: dto.DeviceId,
      SyncedAt: new Date().toISOString(),
      ...results,
    };
  }

  /**
   * Process single attendance Record
   */
  private async processAttendanceRecord(
    record: AttendanceRecordDto,
    deviceId: number,
    userId: string,
  ): Promise<{ Action: 'created' | 'skipped' }> {
    // Find Employee by device Code
    const mapping = await this.prisma.employeeDeviceMapping.findFirst({
      where: { DeviceCode: record.EmployeeCode },
      include: { Employee: true },
    });

    if (!mapping) {
      throw new Error(`Employee with device Code ${record.EmployeeCode} not found`);
    }

    // Parse datetime and extract date (start of day)
    const recordDateTime = new Date(record.DateTime);
    const recordDate = new Date(recordDateTime);
    recordDate.setHours(0, 0, 0, 0);

    // Determine Status based on Type
    let statusCode = 'PRESENT';
    if (record.Type === 'CHECK_IN') {
      // Check if late
      const schedule = await this.getEmployeeSchedule(mapping.EmployeeID, recordDate);
      if (schedule && schedule.CheckInTime) {
        const scheduleTime = new Date(`${recordDate.toDateString()} ${schedule.CheckInTime}`);
        if (recordDateTime > scheduleTime) {
          statusCode = 'LATE';
        }
      }
    }

    // Get attendance Status
    const attendanceStatus = await this.prisma.attendanceStatus.findFirst({
      where: { Code: statusCode },
    });

    // Check if attendance already exists for this Date and Type
    const existing = await this.prisma.attendance.findFirst({
      where: {
        EmployeeID: mapping.EmployeeID,
        Date: recordDate,
        Status: { Code: { contains: record.Type.includes('OUT') ? 'OUT' : 'IN' } },
      },
    });

    if (existing) {
      // UpDate existing Record
      const updateData: any = {};

      if (record.Type.includes('IN')) {
        updateData.CheckIn = recordDateTime;
      } else {
        updateData.CheckOut = recordDateTime;
      }

      await this.prisma.attendance.update({
        where: { ID: existing.ID },
        data: updateData,
      });
    } else {
      // Create new attendance Record
      await this.prisma.attendance.create({
        data: {
          EmployeeID: mapping.EmployeeID,
          Date: recordDate,
          CheckIn: record.Type.includes('IN') ? recordDateTime : null,
          CheckOut: record.Type.includes('OUT') ? recordDateTime : null,
          StatusID: attendanceStatus?.ID || 1,
          Notes: `Synced from device. Type: ${record.Type}`,
        },
      });
    }

    // Log the sync
    await this.logAttendanceSync(deviceId, mapping.EmployeeID, record, recordDateTime, userId);

    return { Action: 'created' };
  }

  private async getEmployeeSchedule(employeeId: number, date: Date): Promise<{ CheckInTime?: string; CheckOutTime?: string } | null> {
    const assignment = await this.prisma.scheduleAssignment.findFirst({
      where: {
        EmployeeID: employeeId,
        EffectiveFrom: { lte: date },
        EffectiveUntil: { gte: date },
      },
      include: { Schedule: true },
    });

    if (!assignment?.Schedule) return null;

    const dayOfWeek = date.getDay();
    const dayMap: Record<number, string> = {
      0: 'Sun',
      1: 'Mon',
      2: 'Tue',
      3: 'Wed',
      4: 'Thu',
      5: 'Fri',
      6: 'Sat',
    };

    const day = dayMap[dayOfWeek];
    const scheduleData = assignment.Schedule as any;

    return {
      CheckInTime: scheduleData[`${day}In`],
      CheckOutTime: scheduleData[`${day}Out`],
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCHEDULE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create work Schedule
   */
  async createSchedule(dto: ScheduleDto, userId: string) {
    const schedule = await this.prisma.workSchedule.create({
      data: {
        Name: dto.Name,
        MonIn: dto.MonIn,
        MonOut: dto.MonOut,
        TueIn: dto.TueIn,
        TueOut: dto.TueOut,
        WedIn: dto.WedIn,
        WedOut: dto.WedOut,
        ThuIn: dto.ThuIn,
        ThuOut: dto.ThuOut,
        FriIn: dto.FriIn,
        FriOut: dto.FriOut,
        SatIn: dto.SatIn,
        SatOut: dto.SatOut,
        SunIn: dto.SunIn,
        SunOut: dto.SunOut,
      },
    });

    return {
      Success: true,
      Schedule: this.formatSchedule(schedule),
    };
  }

  /**
   * List Schedules
   */
  async listSchedules() {
    const schedules = await this.prisma.workSchedule.findMany({
      orderBy: { Name: 'asc' },
    });

    return schedules.map((s) => this.formatSchedule(s));
  }

  /**
   * Assign Schedule to Employees
   */
  async assignSchedule(dto: AssignScheduleDto, userId: string) {
    const results: Array<{ EmployeeID: number; EmployeeName?: string; ScheduleName?: string }> = [];

    for (const employeeId of dto.EmployeeIds) {
      const assignment = await this.prisma.scheduleAssignment.create({
        data: {
          EmployeeID: employeeId,
          ScheduleID: dto.ScheduleId,
          EffectiveFrom: dto.EffectiveFrom ? new Date(dto.EffectiveFrom) : new Date(),
          EffectiveUntil: dto.EffectiveUntil ? new Date(dto.EffectiveUntil) : null,
        },
        include: {
          Employee: true,
          Schedule: true,
        },
      });

      results.push({
        EmployeeID: employeeId,
        EmployeeName: assignment.Employee?.Name,
        ScheduleName: assignment.Schedule?.Name,
      })
    }

    return {
      Success: true,
      Assigned: results.length,
      Assignments: results,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DEVICE Logos
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get device Logos
   */
  async getDeviceLogs(dto: DeviceLogDto) {
    const where: any = {};

    if (dto.DeviceId) where.DeviceID = dto.DeviceId;
    if (dto.LogType) where.LogType = dto.LogType;

    if (dto.StartDate || dto.EndDate) {
      where.CreatedAt = {};
      if (dto.StartDate) {
        where.CreatedAt.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.CreatedAt.lte = new Date(dto.EndDate);
      }
    }

    const logs = await this.prisma.attendanceDeviceLog.findMany({
      where,
      include: { Device: true },
      orderBy: { CreatedAt: 'desc' },
      take: 100,
    });

    return logs.map((l) => ({
      Id: l.ID,
      DeviceId: l.DeviceID,
      DeviceName: l.Device?.Name,
      LogType: l.LogType,
      Message: l.Message,
      Details: l.Details,
      CreatedAt: l.CreatedAt,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async simulateConnection(device: any): Promise<boolean> {
    // In real implementation, this would ping the device or try to connect
    // For demo purposes, we return true
    return true;
  }

  private async logDeviceCommand(deviceId: number, command: string, userId?: string, executedBy?: string) {
    return this.prisma.attendanceDeviceLog.create({
      data: {
        DeviceID: deviceId,
        LogType: 'COMMAND',
        Message: `Executed command: ${command}`,
        Details: JSON.stringify({ command, userId, executedBy }),
      },
    });
  }

  private async logAttendanceSync(deviceId: number, employeeId: number, record: AttendanceRecordDto, dateTime: Date, userId: string) {
    return this.prisma.attendanceDeviceLog.create({
      data: {
        DeviceID: deviceId,
        LogType: 'SYNC',
        Message: `Synced attendance for Employee ${record.EmployeeCode}`,
        Details: JSON.stringify({
          EmployeeId: employeeId,
          RecordType: record.Type,
          DateTime: dateTime.toISOString(),
          Verification: record.Verification,
        }),
      },
    });
  }

  private formatDevice(device: any) {
    return {
      Id: device.ID,
      Code: device.Code,
      Name: device.Name,
      Host: device.Host,
      Port: device.Port,
      DeviceType: device.DeviceType,
      Location: device.Location,
      IsActive: device.IsActive,
      LastSyncAt: device.LastSyncAt,
      CreatedAt: device.CreatedAt,
    };
  }

  private formatMapping(mapping: any) {
    return {
      Id: mapping.ID,
      EmployeeId: mapping.EmployeeID,
      DeviceCode: mapping.DeviceCode,
      HasFingerprint: !!mapping.FingerprintTemplate,
      HasFaceTemplate: !!mapping.FaceTemplate,
      CreatedAt: mapping.CreatedAt,
    };
  }

  private formatSchedule(schedule: any) {
    return {
      Id: schedule.ID,
      Name: schedule.Name,
      Mon: schedule.MonIn && schedule.MonOut ? `${schedule.MonIn} - ${schedule.MonOut}` : null,
      Tue: schedule.TueIn && schedule.TueOut ? `${schedule.TueIn} - ${schedule.TueOut}` : null,
      Wed: schedule.WedIn && schedule.WedOut ? `${schedule.WedIn} - ${schedule.WedOut}` : null,
      Thu: schedule.ThuIn && schedule.ThuOut ? `${schedule.ThuIn} - ${schedule.ThuOut}` : null,
      Fri: schedule.FriIn && schedule.FriOut ? `${schedule.FriIn} - ${schedule.FriOut}` : null,
      Sat: schedule.SatIn && schedule.SatOut ? `${schedule.SatIn} - ${schedule.SatOut}` : null,
      Sun: schedule.SunIn && schedule.SunOut ? `${schedule.SunIn} - ${schedule.SunOut}` : null,
    };
  }

  private async generateDeviceCode(): Promise<string> {
    const prefix = 'DEV';
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    const lastDevice = await this.prisma.attendanceDevice.findFirst({
      where: { Code: { startsWith: `${prefix}-${year}${month}` } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastDevice) {
      const lastSeq = parseInt(lastDevice.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${year}${month}-${String(nextNumber).padStart(4, '0')}`;
  }
}
