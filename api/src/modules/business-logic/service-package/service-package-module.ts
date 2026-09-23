import { Module } from '@nestjs/common';
import { ServicePackageController } from './service-package-controller';
import { ServicePackageService } from './service-package-service';
import { PrismaModule } from '../../../common/prisma/prisma-module';

@Module({
  imports: [PrismaModule],
  controllers: [ServicePackageController],
  providers: [ServicePackageService],
  exports: [ServicePackageService],
})
export class ServicePackageModule {}
