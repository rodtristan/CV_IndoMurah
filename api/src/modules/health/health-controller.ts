// ================================================================
// health-controller.ts — Endpoint Health Check
// ================================================================
//
// Health check adalah endpoint khusus yang digunakan untuk memantau
// apakah aplikasi sedang berjalan dengan baik (alive & healthy).
//
// Digunakan oleh:
//   1. Docker HEALTHCHECK → nilai `healthy` atau `unhealthy` di `docker ps`
//   2. Kubernetes liveness/readiness probe
//   3. Load balancer untuk mengetahui apakah instance perlu di-restart
//   4. Monitoring tools (Uptime Robot, Grafana, dll)
//
// Cara test:
//   curl http://localhost:5000/api/v1/health
//   → { "status": "ok", "timestamp": "2026-08-31T08:00:00.000Z" }
// ================================================================

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')       // Grup di Swagger UI
@Controller('health')    // Route: /api/v1/health
export class HealthController {

  // GET /api/v1/health
  // Endpoint ini SENGAJA tidak butuh autentikasi
  // agar monitoring tool bisa cek tanpa perlu token
  @Get()
  @ApiOperation({ summary: 'Health Check — cek apakah API berjalan' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
