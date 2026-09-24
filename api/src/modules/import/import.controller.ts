import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import {
  ImportItemSatuanDto,
  ImportItemLevelDto,
  ImportItemJumlahDto,
  ValidateImportDto,
} from './import.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('validate')
  async validateImport(@Body() dto: ValidateImportDto) {
    return this.importService.validateImport(dto);
  }

  @Post('items-satuan')
  @UseInterceptors(FileInterceptor('file'))
  async importItemsSatuan(
    @UploadedFile() file: Express.Multer.File,
    @Body('data') dataJson: string,
    @Body('userId') userId: string,
  ) {
    let data: ImportItemSatuanDto[];

    if (file) {
      data = await this.importService.parseCSV(file.buffer);
    } else if (dataJson) {
      data = JSON.parse(dataJson);
    } else {
      throw new Error('No file or data provided');
    }

    return this.importService.importSatuan(data, userId);
  }

  @Post('items-level')
  @UseInterceptors(FileInterceptor('file'))
  async importItemsLevel(
    @UploadedFile() file: Express.Multer.File,
    @Body('data') dataJson: string,
    @Body('userId') userId: string,
  ) {
    let data: ImportItemLevelDto[];

    if (file) {
      data = await this.importService.parseCSV(file.buffer);
    } else if (dataJson) {
      data = JSON.parse(dataJson);
    } else {
      throw new Error('No file or data provided');
    }

    return this.importService.importLevel(data, userId);
  }

  @Post('items-jumlah')
  @UseInterceptors(FileInterceptor('file'))
  async importItemsJumlah(
    @UploadedFile() file: Express.Multer.File,
    @Body('data') dataJson: string,
    @Body('userId') userId: string,
  ) {
    let data: ImportItemJumlahDto[];

    if (file) {
      data = await this.importService.parseCSV(file.buffer);
    } else if (dataJson) {
      data = JSON.parse(dataJson);
    } else {
      throw new Error('No file or data provided');
    }

    return this.importService.importJumlah(data, userId);
  }

  @Get('progress/:importId')
  async getProgress(@Query('importId') importId: string) {
    const progress = this.importService.getProgress(importId);
    if (!progress) {
      return { status: 'not_found', message: 'Import job not found' };
    }
    return progress;
  }
}
