import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    }),
  ],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
