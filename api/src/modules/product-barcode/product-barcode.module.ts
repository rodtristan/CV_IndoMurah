import { Module } from '@nestjs/common';
import { ProductBarcodeController } from './product-barcode.controller';
import { ProductBarcodeService } from './product-barcode.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [ProductBarcodeController],
  providers: [ProductBarcodeService],
  exports: [ProductBarcodeService],
})
export class ProductBarcodeModule {}
