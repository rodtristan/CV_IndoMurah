import { Injectable, BadRequestException, ServiceUnavailableException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const FOLDER_NAME = 'IndoMurah Report Assets';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

/** Storage gambar Report Design di Google Drive (OAuth refresh token; scope drive.file bila folder dibuat otomatis, scope drive bila memakai GDRIVE_FOLDER_ID). */
@Injectable()
export class GDriveService {
  private readonly log = new Logger(GDriveService.name);
  private token: { value: string; exp: number } | null = null;
  private folderId: string | null = null;

  constructor(private readonly config: ConfigService) {}

  private cfg(k: string) {
    return (this.config.get<string>(k) ?? '').trim();
  }

  private assertConfigured() {
    for (const k of ['GDRIVE_CLIENT_ID', 'GDRIVE_CLIENT_SECRET', 'GDRIVE_REFRESH_TOKEN']) {
      if (!this.cfg(k)) throw new ServiceUnavailableException(`Google Drive belum dikonfigurasi (${k} kosong di .env)`);
    }
  }

  private async accessToken(): Promise<string> {
    this.assertConfigured();
    if (this.token && this.token.exp > Date.now() + 60_000) return this.token.value;
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.cfg('GDRIVE_CLIENT_ID'),
        client_secret: this.cfg('GDRIVE_CLIENT_SECRET'),
        refresh_token: this.cfg('GDRIVE_REFRESH_TOKEN'),
        grant_type: 'refresh_token',
      }),
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok || !json.access_token) {
      this.log.error(`Token Google gagal: ${json.error ?? res.status} ${json.error_description ?? ''}`);
      throw new ServiceUnavailableException('Gagal autentikasi ke Google Drive (refresh token tidak valid/kedaluwarsa)');
    }
    this.token = { value: json.access_token, exp: Date.now() + (json.expires_in ?? 3600) * 1000 };
    return this.token.value;
  }

  private async api(url: string, init: RequestInit = {}) {
    const t = await this.accessToken();
    return fetch(url, { ...init, headers: { Authorization: `Bearer ${t}`, ...(init.headers as any) } });
  }

  /** Folder tujuan: GDRIVE_FOLDER_ID bila diisi, kalau tidak dicari/dibuat otomatis. */
  private async folder(): Promise<string> {
    if (this.folderId) return this.folderId;
    const fixed = this.cfg('GDRIVE_FOLDER_ID');
    if (fixed) return (this.folderId = fixed);
    const q = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='${FOLDER_MIME}' and trashed=false`);
    const found: any = await (await this.api(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`)).json();
    if (found.files?.[0]?.id) return (this.folderId = found.files[0].id);
    const created: any = await (
      await this.api('https://www.googleapis.com/drive/v3/files?fields=id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: FOLDER_NAME, mimeType: FOLDER_MIME }),
      })
    ).json();
    if (!created.id) throw new ServiceUnavailableException('Gagal membuat folder di Google Drive');
    return (this.folderId = created.id);
  }

  async upload(name: string, mimeType: string, data: Buffer): Promise<string> {
    const parent = await this.folder();
    const boundary = `b${Date.now().toString(16)}`;
    const meta = JSON.stringify({ name, parents: [parent] });
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
      data,
      Buffer.from(`\r\n--${boundary}--`),
    ]);
    const res = await this.api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok || !json.id) {
      this.log.error(`Upload Drive gagal: ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
      throw new BadRequestException('Gagal mengunggah ke Google Drive');
    }
    return json.id as string;
  }

  /** Ambil isi file; hanya file di dalam folder aset kita yang boleh dibaca. */
  async download(id: string): Promise<{ mimeType: string; data: Buffer }> {
    const parent = await this.folder();
    const metaRes = await this.api(`https://www.googleapis.com/drive/v3/files/${id}?fields=mimeType,parents,trashed`);
    if (!metaRes.ok) throw new NotFoundException('File tidak ditemukan');
    const meta: any = await metaRes.json();
    if (meta.trashed || !meta.parents?.includes(parent) || !String(meta.mimeType).startsWith('image/')) {
      throw new NotFoundException('File tidak ditemukan');
    }
    const res = await this.api(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`);
    if (!res.ok) throw new NotFoundException('File tidak ditemukan');
    return { mimeType: meta.mimeType, data: Buffer.from(await res.arrayBuffer()) };
  }
}
