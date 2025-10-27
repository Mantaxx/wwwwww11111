import { createClient, RedisClientType } from 'redis';

class RedisManager {
  private static instance: RedisManager;
  private client: RedisClientType | null = null;
  private isConnected = false;

  private constructor() {}

  static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    // Don't attempt to connect during build time or in test environment
    if (typeof window !== 'undefined' || process.env.NODE_ENV === 'test') {
      this.isConnected = false;
      return;
    }

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 60000,
        },
      });

      this.client.on('error', err => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Connected to Redis');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('Redis client ready');
      });

      this.client.on('end', () => {
        console.log('Redis connection ended');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Fallback to in-memory cache
      this.client = null;
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  isRedisAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  getClient(): RedisClientType | null {
    return this.client;
  }

  // Generic cache operations
  async get(key: string): Promise<string | null> {
    if (!this.isRedisAvailable()) return null;

    try {
      return await this.client!.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.isRedisAvailable()) return false;

    try {
      if (ttlSeconds) {
        await this.client!.setEx(key, ttlSeconds, value);
      } else {
        await this.client!.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isRedisAvailable()) return false;

    try {
      await this.client!.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isRedisAvailable()) return false;

    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.isRedisAvailable()) return false;

    try {
      await this.client!.expire(key, ttlSeconds);
      return true;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.isRedisAvailable()) return -2;

    try {
      return await this.client!.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -2;
    }
  }

  // JSON operations
  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Redis JSON parse error:', error);
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      return await this.set(key, jsonString, ttlSeconds);
    } catch (error) {
      console.error('Redis JSON stringify error:', error);
      return false;
    }
  }

  // Cache operations with fallback
  async getWithFallback<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    // Try Redis first
    if (this.isRedisAvailable()) {
      const cached = await this.getJson<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Fallback to function
    const data = await fallbackFn();

    // Cache the result if Redis is available
    if (this.isRedisAvailable()) {
      await this.setJson(key, data, ttlSeconds);
    }

    return data;
  }
}

// Export singleton instance
export const redisManager = RedisManager.getInstance();

// Graceful shutdown
if (typeof window === 'undefined') {
  process.on('SIGTERM', async () => {
    await redisManager.disconnect();
  });

  process.on('SIGINT', async () => {
    await redisManager.disconnect();
  });
}
