import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma-service';
import { GDriveService } from '../file-storage/gdrive.service';

/**
 * Foto absensi disimpan ke Google Drive bila GDRIVE_REFRESH_TOKEN terisi,
 * kalau belum ke tabel AttendancePhotos. Referensi yang disimpan di Attendance:
 * "gdrive:<fileId>" atau "db:<id>".
 */
@Injectable()
export class AttendancePhotoStore {
  constructor(
    private readonly prisma: PrismaService,
    private readonly drive: GDriveService,
    private readonly config: ConfigService,
  ) {}

  private driveEnabled() {
    return !!(this.config.get<string>('GDRIVE_REFRESH_TOKEN') ?? '').trim();
  }

  async save(name: string, mimeType: string, data: Buffer): Promise<string> {
    if (this.driveEnabled()) return `gdrive:${await this.drive.upload(name, mimeType, data)}`;
    const row = await this.prisma.attendancePhoto.create({ data: { MimeType: mimeType, Data: new Uint8Array(data) } });
    return `db:${row.ID}`;
  }

  async load(ref: string): Promise<{ mimeType: string; data: Buffer }> {
    const [kind, id] = ref.split(':');
    if (kind === 'gdrive' && id) return this.drive.download(id);
    if (kind === 'db' && /^\d+$/.test(id ?? '')) {
      const row = await this.prisma.attendancePhoto.findUnique({ where: { ID: Number(id) } });
      if (row) return { mimeType: row.MimeType, data: Buffer.from(row.Data) };
    }
    throw new NotFoundException('Foto tidak ditemukan');
  }
}
