import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', '127.0.0.1'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD', ''),
      db: this.configService.get<number>('REDIS_DB', 0),
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.warn('Redis retry limit reached, running without cache');
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    // Pasang error listener SEBELUM connect() agar EventEmitter tidak
    // melempar "Unhandled error event" saat Redis tidak tersedia.
    this.client.on('error', (err: NodeJS.ErrnoException) => {
      if (!['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET'].includes(err.code ?? '')) {
        this.logger.error(`Redis error: ${err.message}`);
      }
    });

    try {
      await this.client.connect();
      this.logger.log('✅ Redis connected');
    } catch {
      this.logger.warn('⚠️ Redis not available, running without cache');
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('🔌 Redis disconnected');
    }
  }

  getClient(): Redis {
    return this.client;
  }

  /** Untuk health check: true bila Redis siap & menjawab PING. */
  async ping(): Promise<boolean> {
    try {
      if (!this.client || this.client.status !== 'ready') return false;
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Get cached value by key
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (!this.client || this.client.status !== 'ready') return null;
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  /**
   * Set cache with TTL (in seconds)
   */
  async set(key: string, value: any, ttl: number = 60): Promise<void> {
    try {
      if (!this.client || this.client.status !== 'ready') return;
      await this.client.setex(key, ttl, JSON.stringify(value));
    } catch {
      // Silently fail — cache is optional
    }
  }

  /**
   * Delete cache by key
   */
  async del(key: string): Promise<void> {
    try {
      if (!this.client || this.client.status !== 'ready') return;
      await this.client.del(key);
    } catch {
      // Silently fail
    }
  }

  /**
   * Delete all cache keys matching a pattern
   * Example: invalidatePattern('products:*') removes all product caches
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (!this.client || this.client.status !== 'ready') return;
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch {
      // Silently fail
    }
  }

  /**
   * Get or set — fetch from cache, or compute and cache
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl: number = 60): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }
}
