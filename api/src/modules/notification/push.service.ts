// ================================================================
// push.service.ts — Web Push (notifikasi sistem di HP & desktop)
// ================================================================
//
// Browser (Chrome/Edge/Firefox di Windows & Android, Safari PWA di iOS)
// mendaftarkan "subscription" lewat service worker web/public/sw.js.
// Setiap Notification yang dibuat ikut dikirim ke subscription milik user
// tujuan (UserID null = broadcast ke semua user).
//
// Kunci VAPID dibaca dari env VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY /
// VAPID_SUBJECT. Buat sekali dengan: npx web-push generate-vapid-keys
// Tanpa kunci, push dimatikan (notifikasi di lonceng web tetap jalan).
// ================================================================

import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../../common/prisma/prisma-service';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  typeCode?: string;
}

/** Halaman web yang dibuka saat notifikasi diklik. */
const REFERENCE_URL: Record<string, string> = {
  Sale: '/sale/list',
  Purchase: '/purchase/list',
  Product: '/master/items',
  Attendance: '/hr/attendance',
};

export function referenceUrl(referenceType?: string | null): string {
  return (referenceType && REFERENCE_URL[referenceType]) || '/dashboard';
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private publicKey = '';
  private enabled = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const pub = (this.config.get<string>('VAPID_PUBLIC_KEY') ?? '').trim();
    const priv = (this.config.get<string>('VAPID_PRIVATE_KEY') ?? '').trim();
    const subject = (this.config.get<string>('VAPID_SUBJECT') ?? '').trim() || 'mailto:admin@localhost';
    if (!pub || !priv) {
      this.logger.warn('VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY kosong — Web Push dimatikan.');
      return;
    }
    try {
      webpush.setVapidDetails(subject, pub, priv);
      this.publicKey = pub;
      this.enabled = true;
    } catch (e) {
      this.logger.error(`Kunci VAPID tidak valid — Web Push dimatikan: ${(e as Error).message}`);
    }
  }

  getPublicKey(): string {
    if (!this.enabled) throw new ServiceUnavailableException('Notifikasi push belum dikonfigurasi di server (VAPID).');
    return this.publicKey;
  }

  async subscribe(userId: string, sub: { endpoint: string; p256dh: string; auth: string }, userAgent?: string) {
    // Endpoint unik per browser: bila browser ini sebelumnya dipakai user lain,
    // pindahkan ke user yang sekarang login.
    await this.prisma.pushSubscription.upsert({
      where: { Endpoint: sub.endpoint },
      create: { UserID: userId, Endpoint: sub.endpoint, P256dh: sub.p256dh, Auth: sub.auth, UserAgent: userAgent?.slice(0, 500) },
      update: { UserID: userId, P256dh: sub.p256dh, Auth: sub.auth, UserAgent: userAgent?.slice(0, 500) },
    });
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({ where: { UserID: userId, Endpoint: endpoint } });
  }

  async countForUser(userId: string): Promise<number> {
    return this.prisma.pushSubscription.count({ where: { UserID: userId } });
  }

  /**
   * Kirim ke semua perangkat user (atau semua user bila userId kosong).
   * Best-effort: error tidak pernah dilempar ke pemanggil.
   * Mengembalikan jumlah perangkat yang berhasil dikirimi.
   */
  async send(userId: string | null | undefined, payload: PushPayload): Promise<number> {
    if (!this.enabled) return 0;
    try {
      const subs = await this.prisma.pushSubscription.findMany({
        where: userId ? { UserID: userId } : { User: { IsActive: true } },
      });
      if (!subs.length) return 0;
      const body = JSON.stringify(payload);
      const results = await Promise.allSettled(
        subs.map((s) =>
          webpush.sendNotification({ endpoint: s.Endpoint, keys: { p256dh: s.P256dh, auth: s.Auth } }, body, {
            TTL: 60 * 60 * 24,
            urgency: 'high',
          }),
        ),
      );
      const ok: number[] = [];
      const gone: number[] = [];
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') ok.push(subs[i].ID);
        else {
          const code = (r.reason as { statusCode?: number })?.statusCode;
          // 404/410 = subscription sudah dicabut browser → hapus.
          if (code === 404 || code === 410) gone.push(subs[i].ID);
          else this.logger.warn(`Push gagal (${code ?? 'error'}): ${(r.reason as Error)?.message ?? r.reason}`);
        }
      });
      if (gone.length) await this.prisma.pushSubscription.deleteMany({ where: { ID: { in: gone } } });
      if (ok.length) await this.prisma.pushSubscription.updateMany({ where: { ID: { in: ok } }, data: { LastSuccessAt: new Date() } });
      return ok.length;
    } catch (e) {
      this.logger.warn(`Push dilewati: ${(e as Error).message}`);
      return 0;
    }
  }
}
