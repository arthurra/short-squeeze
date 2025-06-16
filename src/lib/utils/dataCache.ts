interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface RateLimit {
  requestsPerMinute: number;
  requestsPerDay: number;
}

export class DataCache {
  private static instance: DataCache;
  private cache: Map<string, CacheEntry<any>>;
  private requestCounts: Map<string, { minute: number[]; day: number[] }>;
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cache = new Map();
    this.requestCounts = new Map();
  }

  static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache();
    }
    return DataCache.instance;
  }

  private getRequestKey(api: string, endpoint: string): string {
    return `${api}:${endpoint}`;
  }

  private isRateLimited(
    api: string,
    endpoint: string,
    rateLimit: RateLimit
  ): boolean {
    const key = this.getRequestKey(api, endpoint);
    const now = Date.now();
    const minuteAgo = now - 60 * 1000;
    const dayAgo = now - 24 * 60 * 60 * 1000;

    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, { minute: [], day: [] });
    }

    const counts = this.requestCounts.get(key)!;

    // Clean up old timestamps
    counts.minute = counts.minute.filter((time) => time > minuteAgo);
    counts.day = counts.day.filter((time) => time > dayAgo);

    // Check rate limits
    if (counts.minute.length >= rateLimit.requestsPerMinute) {
      return true;
    }
    if (counts.day.length >= rateLimit.requestsPerDay) {
      return true;
    }

    // Add new request timestamp
    counts.minute.push(now);
    counts.day.push(now);
    return false;
  }

  async get<T>(
    api: string,
    endpoint: string,
    key: string,
    fetchFn: () => Promise<T>,
    rateLimit: RateLimit,
    expiry: number = this.DEFAULT_EXPIRY
  ): Promise<T> {
    const cacheKey = `${api}:${endpoint}:${key}`;
    const now = Date.now();

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && now - cached.timestamp < cached.expiry) {
      return cached.data;
    }

    // Check rate limit
    if (this.isRateLimited(api, endpoint, rateLimit)) {
      throw new Error(`Rate limit exceeded for ${api} ${endpoint}`);
    }

    // Fetch new data
    const data = await fetchFn();
    this.cache.set(cacheKey, {
      data,
      timestamp: now,
      expiry,
    });

    return data;
  }

  clear(): void {
    this.cache.clear();
    this.requestCounts.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}
