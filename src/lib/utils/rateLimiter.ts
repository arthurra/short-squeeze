import { config } from '../config/env';

/**
 * Rate limiter using sliding window algorithm
 */
export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private requests: number[];
  private lastCleanup: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
    this.lastCleanup = Date.now();
  }

  /**
   * Cleans up old requests outside the current window
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    // Remove requests older than the window
    this.requests = this.requests.filter((time) => time > cutoff);
    this.lastCleanup = now;
  }

  /**
   * Executes a function with rate limiting
   * @param fn The function to execute
   * @returns The result of the function
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.cleanup();

    if (this.requests.length >= this.maxRequests) {
      // Calculate wait time until oldest request expires
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (Date.now() - oldestRequest);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.execute(fn);
    }

    this.requests.push(Date.now());
    return fn();
  }
}

// Create a singleton instance with rate limit from config
export const rateLimiter = new RateLimiter(config.apiRateLimit, 60000);

/**
 * Wraps a function with rate limiting
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: Parameters<T>) => {
    return rateLimiter.execute(() => fn(...args));
  }) as T;
}
