import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { NotificationModule } from '../notification/notification.module';
import { AttendanceAdminController } from './attendance-admin.controller';
import { AttendanceAdminService } from './attendance-admin.service';
import { AttendanceMobileController } from './attendance-mobile.controller';
import { AttendanceMobileService } from './attendance-mobile.service';
import { AttendancePhotoStore } from './attendance-photo.store';
import { EmployeeAuthGuard } from './employee-auth.guard';

@Module({
  imports: [
    FileStorageModule,
    NotificationModule,
    // Secret berbeda dari token back office, sehingga token karyawan ditolak JwtAuthGuard admin.
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('EMPLOYEE_JWT_SECRET') ||
          `${config.get<string>('JWT_SECRET') || config.get<string>('jwt.secret') || 'fallback-secret'}:employee-mobile`,
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  controllers: [AttendanceMobileController, AttendanceAdminController],
  providers: [AttendanceMobileService, AttendanceAdminService, AttendancePhotoStore, EmployeeAuthGuard],
})
export class AttendanceMobileModule {}
