import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { CacheManager, CACHE_KEYS, CACHE_TTL } from './cache';
import { kv } from '../kv';

// Mock the KV store
jest.mock('../kv', () => ({
  kv: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  },
}));

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    jest.clearAllMocks();
    cacheManager = CacheManager.getInstance();
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      (kv.get as jest.Mock).mockResolvedValue(null);
      const result = await cacheManager.get('non-existent');
      expect(result).toBeNull();
    });

    it('should return data for valid cache entry', async () => {
      const mockData = { test: 'data' };
      const mockEntry = {
        data: mockData,
        metadata: {
          timestamp: Date.now(),
          ttl: 300,
          version: '1.0.0',
        },
      };

      (kv.get as jest.Mock).mockResolvedValue(mockEntry);
      const result = await cacheManager.get('test-key');
      expect(result).toEqual(mockData);
    });

    it('should return null for expired cache entry', async () => {
      const mockEntry = {
        data: { test: 'data' },
        metadata: {
          timestamp: Date.now() - 3600000, // 1 hour ago
          ttl: 300, // 5 minutes TTL
          version: '1.0.0',
        },
      };

      (kv.get as jest.Mock).mockResolvedValue(mockEntry);
      const result = await cacheManager.get('test-key');
      expect(result).toBeNull();
      expect(kv.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('set', () => {
    it('should set data with metadata', async () => {
      const mockData = { test: 'data' };
      await cacheManager.set('test-key', mockData);

      expect(kv.set).toHaveBeenCalledWith(
        'test-key',
        expect.objectContaining({
          data: mockData,
          metadata: expect.objectContaining({
            timestamp: expect.any(Number),
            ttl: expect.any(Number),
            version: '1.0.0',
          }),
        }),
        expect.any(Object),
      );
    });

    it('should use custom TTL when provided', async () => {
      const mockData = { test: 'data' };
      const customTTL = 600;
      await cacheManager.set('test-key', mockData, customTTL);

      expect(kv.set).toHaveBeenCalledWith(
        'test-key',
        expect.objectContaining({
          metadata: expect.objectContaining({
            ttl: customTTL,
          }),
        }),
        { ex: customTTL },
      );
    });
  });

  describe('delete', () => {
    it('should delete cache entry', async () => {
      await cacheManager.delete('test-key');
      expect(kv.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('clearByPrefix', () => {
    it('should clear all entries with matching prefix', async () => {
      const mockKeys = ['prefix:key1', 'prefix:key2'];
      (kv.keys as jest.Mock).mockResolvedValue(mockKeys);

      await cacheManager.clearByPrefix('prefix');
      expect(kv.keys).toHaveBeenCalledWith('prefix:*');
      expect(kv.del).toHaveBeenCalledTimes(2);
      expect(kv.del).toHaveBeenCalledWith('prefix:key1');
      expect(kv.del).toHaveBeenCalledWith('prefix:key2');
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const mockKeys = ['key1', 'key2', 'key3'];
      (kv.keys as jest.Mock).mockResolvedValue(mockKeys);

      const stats = await cacheManager.getStats();
      expect(stats).toEqual({
        totalKeys: 3,
        memoryUsage: 0,
        hitRate: 0,
      });
    });

    it('should handle errors gracefully', async () => {
      (kv.keys as jest.Mock).mockRejectedValue(new Error('KV error'));

      const stats = await cacheManager.getStats();
      expect(stats).toEqual({
        totalKeys: 0,
        memoryUsage: 0,
        hitRate: 0,
      });
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CacheManager.getInstance();
      const instance2 = CacheManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
