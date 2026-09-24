import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { ProductImportController } from './product-import.controller';
import { ProductImportService } from './product-import.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductImportController],
  providers: [ProductImportService],
})
export class ProductImportModule {}
