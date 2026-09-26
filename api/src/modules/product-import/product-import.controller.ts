import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ImportBody, ProductImportService } from './product-import.service';

@ApiTags('ProductImport')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('product-import')
export class ProductImportController {
  constructor(private readonly service: ProductImportService) {}

  @Post()
  @ApiOperation({ summary: 'Import items: multi-unit / level prices / quantity-tier prices' })
  async import(@Body() body: ImportBody, @CurrentUser('id') userId: string) {
    return { success: true, data: await this.service.import(body, userId) };
  }
}
