import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma-service';

export const EMPLOYEE_JWT = 'EMPLOYEE_JWT';

/** Guard aplikasi mobile absensi. Token ditandatangani secret terpisah dari token back office. */
@Injectable()
export class EmployeeAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const header: string = req.headers?.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new UnauthorizedException('Silakan login');
    let payload: { typ?: string; employeeId?: number };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Sesi berakhir, silakan login ulang');
    }
    if (payload.typ !== 'employee' || !payload.employeeId) throw new UnauthorizedException('Token tidak valid');
    const emp = await this.prisma.employee.findUnique({
      where: { ID: payload.employeeId },
      select: { ID: true, Code: true, Name: true, IsActive: true, Username: true, AttendanceLocationID: true },
    });
    if (!emp || !emp.IsActive || !emp.Username) throw new UnauthorizedException('Akun absensi tidak aktif');
    req.employee = emp;
    return true;
  }
}

export const CurrentEmployee = createParamDecorator((_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().employee);
