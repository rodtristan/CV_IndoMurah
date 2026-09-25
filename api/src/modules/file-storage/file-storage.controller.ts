import { Controller, Get, Param, Post, Req, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { GDriveService } from './gdrive.service';

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };

@ApiTags('File Storage')
@Controller('files')
export class FileStorageController {
  constructor(private readonly drive: GDriveService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  async uploadImage(@Req() req: any) {
    if (!req.isMultipart?.()) throw new BadRequestException('Gunakan multipart/form-data dengan field "file"');
    const file = await req.file();
    if (!file) throw new BadRequestException('File tidak ditemukan');
    if (!ALLOWED.has(file.mimetype)) throw new BadRequestException('Hanya gambar PNG, JPG, GIF, atau WEBP');
    const buf: Buffer = await file.toBuffer();
    if (file.file.truncated) throw new BadRequestException('Ukuran gambar maksimal 2 MB');
    const id = await this.drive.upload(`report-${Date.now()}.${EXT[file.mimetype]}`, file.mimetype, buf);
    return { success: true, data: { id, path: `files/${id}/content` } };
  }

  // Tanpa JWT: dipakai <img src> pada preview/cetak. ID Drive tidak bisa ditebak dan hanya file di folder aset yang dilayani.
  @Get(':id/content')
  async content(@Param('id') id: string, @Res() reply: any) {
    if (!/^[A-Za-z0-9_-]{10,100}$/.test(id)) throw new BadRequestException('ID tidak valid');
    const { mimeType, data } = await this.drive.download(id);
    reply
      .header('Content-Type', mimeType)
      .header('Cache-Control', 'public, max-age=86400')
      .header('Cross-Origin-Resource-Policy', 'cross-origin')
      .header('X-Content-Type-Options', 'nosniff')
      .send(data);
  }
}
