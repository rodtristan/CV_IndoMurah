import { Controller, Get, Param, Post, Req, Res, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { GDriveService } from './gdrive.service';
import { PrismaService } from '../../common/prisma/prisma-service';

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };

@ApiTags('File Storage')
@Controller('files')
export class FileStorageController {
  constructor(
    private readonly drive: GDriveService,
    private readonly prisma: PrismaService,
  ) {}

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
    if (file.file.truncated || buf.length > 2 * 1024 * 1024) throw new BadRequestException('Ukuran gambar maksimal 2 MB');
    const name = `img-${Date.now()}.${EXT[file.mimetype]}`;
    // Google Drive bila dikonfigurasi; bila belum, simpan di database (id berawalan "db-").
    const id = this.drive.isConfigured()
      ? await this.drive.upload(name, file.mimetype, buf)
      : `db-${(await this.prisma.storedFile.create({ data: { Name: name, MimeType: file.mimetype, SizeBytes: buf.length, Data: new Uint8Array(buf) } })).ID}`;
    return { success: true, data: { id, path: `files/${id}/content` } };
  }

  // Tanpa JWT: dipakai <img src> pada preview/cetak. ID Drive tidak bisa ditebak dan hanya file di folder aset yang dilayani.
  @Get(':id/content')
  async content(@Param('id') id: string, @Res() reply: any) {
    if (!/^[A-Za-z0-9_-]{10,100}$/.test(id)) throw new BadRequestException('ID tidak valid');
    let mimeType: string;
    let data: Buffer;
    if (id.startsWith('db-')) {
      const row = await this.prisma.storedFile.findUnique({ where: { ID: id.slice(3) } }).catch(() => null);
      if (!row) throw new NotFoundException('File tidak ditemukan');
      mimeType = row.MimeType;
      data = Buffer.from(row.Data);
    } else {
      ({ mimeType, data } = await this.drive.download(id));
    }
    reply
      .header('Content-Type', mimeType)
      .header('Cache-Control', 'public, max-age=86400')
      .header('Cross-Origin-Resource-Policy', 'cross-origin')
      .header('X-Content-Type-Options', 'nosniff')
      .send(data);
  }
}
