import { kv } from '../../../lib/kv';
import { config } from '../config/env';

// Cache key prefixes for different data types
export const CACHE_KEYS = {
  STOCK_DATA: 'stock_data',
  HISTORICAL_DATA: 'historical_data',
  MARKET_DATA: 'market_data',
  NEWS_DATA: 'news_data',
  LAST_UPDATE: 'last_update',
} as const;

// Cache TTLs in seconds
export const CACHE_TTL = {
  STOCK_DATA: 300, // 5 minutes for real-time stock data
  HISTORICAL_DATA: 3600, // 1 hour for historical data
  MARKET_DATA: 1800, // 30 minutes for market data
  NEWS_DATA: 900, // 15 minutes for news data
} as const;

// Cache metadata interface
interface CacheMetadata {
  timestamp: number;
  ttl: number;
  version: string;
}

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  metadata: CacheMetadata;
}

/**
 * Cache manager class for handling different types of data
 */
export class CacheManager {
  private static instance: CacheManager;
  private version: string;

  private constructor() {
    this.version = '1.0.0'; // Increment this when cache structure changes
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Get cached data with type safety
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const entry = await kv.get<CacheEntry<T>>(key);
      if (!entry) return null;

      // Check if cache is expired
      if (this.isExpired(entry.metadata)) {
        await this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data in cache with metadata
   */
  public async set<T>(key: string, data: T, ttl: number = config.cacheTTL): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        metadata: {
          timestamp: Date.now(),
          ttl,
          version: this.version,
        },
      };

      await kv.set(key, entry, { ex: ttl });
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete data from cache
   */
  public async delete(key: string): Promise<void> {
    try {
      await kv.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(metadata: CacheMetadata): boolean {
    const now = Date.now();
    return now - metadata.timestamp > metadata.ttl * 1000;
  }

  /**
   * Clear all cache entries with a specific prefix
   */
  public async clearByPrefix(prefix: string): Promise<void> {
    try {
      const keys = await kv.keys(`${prefix}:*`);
      await Promise.all(keys.map((key) => this.delete(key)));
    } catch (error) {
      console.error(`Cache clear error for prefix ${prefix}:`, error);
    }
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: number;
    hitRate: number;
  }> {
    try {
      const keys = await kv.keys('*');
      return {
        totalKeys: keys.length,
        memoryUsage: 0, // Vercel KV doesn't provide memory usage stats
        hitRate: 0, // Would need to implement hit tracking
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: 0,
        hitRate: 0,
      };
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();
