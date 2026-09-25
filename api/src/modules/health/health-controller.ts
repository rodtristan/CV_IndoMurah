// ================================================================
// health-controller.ts — Endpoint Health Check
// ================================================================
//
// GET /api/v1/health (tanpa autentikasi, untuk Docker/Railway/monitoring)
//   200 { status: 'ok',       checks: { database: 'up', redis: 'up' } }
//   200 { status: 'degraded', checks: { database: 'up', redis: 'down' } }
//        → Redis hanya cache; API tetap berfungsi tanpa Redis.
//   503 { status: 'error',    checks: { database: 'down', ... } }
//        → Database tidak bisa dihubungi; instance tidak sehat.
// Tidak ada detail error/koneksi yang dikembalikan ke klien.
// ================================================================

import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';

const DB_TIMEOUT_MS = 3000;

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health Check — cek API, database (SELECT 1) & Redis' })
  async check(@Res({ passthrough: true }) reply: { status: (code: number) => unknown }) {
    const [database, redis] = await Promise.all([this.checkDb(), this.redis.ping()]);
    const status = !database ? 'error' : redis ? 'ok' : 'degraded';
    if (!database) reply.status(HttpStatus.SERVICE_UNAVAILABLE);
    return {
      status,
      checks: { database: database ? 'up' : 'down', redis: redis ? 'up' : 'down' },
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDb(): Promise<boolean> {
    try {
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), DB_TIMEOUT_MS)),
      ]);
      return true;
    } catch {
      return false;
    }
  }
}
