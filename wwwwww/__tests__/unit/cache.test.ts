import { redisManager } from '@/lib/redis';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Redis manager
vi.mock('@/lib/redis', () => ({
  redisManager: {
    isRedisAvailable: vi.fn(),
    getJson: vi.fn(),
    setJson: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
  },
}));

describe('Cache System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Redis Manager', () => {
    it('should check if Redis is available', () => {
      vi.mocked(redisManager.isRedisAvailable).mockReturnValue(true);

      const isAvailable = redisManager.isRedisAvailable();

      expect(isAvailable).toBe(true);
      expect(redisManager.isRedisAvailable).toHaveBeenCalled();
    });

    it('should get JSON data from Redis', async () => {
      const mockData = { test: 'data' };
      vi.mocked(redisManager.getJson).mockResolvedValue(mockData);

      const result = await redisManager.getJson('test-key');

      expect(result).toEqual(mockData);
      expect(redisManager.getJson).toHaveBeenCalledWith('test-key');
    });

    it('should set JSON data in Redis', async () => {
      const mockData = { test: 'data' };
      vi.mocked(redisManager.setJson).mockResolvedValue(true);

      const result = await redisManager.setJson('test-key', mockData, 300);

      expect(result).toBe(true);
      expect(redisManager.setJson).toHaveBeenCalledWith('test-key', mockData, 300);
    });

    it('should delete data from Redis', async () => {
      vi.mocked(redisManager.del).mockResolvedValue(true);

      const result = await redisManager.del('test-key');

      expect(result).toBe(true);
      expect(redisManager.del).toHaveBeenCalledWith('test-key');
    });

    it('should check if key exists in Redis', async () => {
      vi.mocked(redisManager.exists).mockResolvedValue(true);

      const result = await redisManager.exists('test-key');

      expect(result).toBe(true);
      expect(redisManager.exists).toHaveBeenCalledWith('test-key');
    });

    it('should set expiration time for key', async () => {
      vi.mocked(redisManager.expire).mockResolvedValue(true);

      const result = await redisManager.expire('test-key', 300);

      expect(result).toBe(true);
      expect(redisManager.expire).toHaveBeenCalledWith('test-key', 300);
    });

    it('should get TTL for key', async () => {
      vi.mocked(redisManager.ttl).mockResolvedValue(150);

      const result = await redisManager.ttl('test-key');

      expect(result).toBe(150);
      expect(redisManager.ttl).toHaveBeenCalledWith('test-key');
    });
  });
});
