import { config } from '../config/env';

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second

  constructor(requestsPerSecond: number) {
    this.maxTokens = requestsPerSecond;
    this.tokens = requestsPerSecond;
    this.refillRate = requestsPerSecond;
    this.lastRefill = Date.now();
  }

  /**
   * Refills the token bucket based on elapsed time
   */
  private refillTokens(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // convert to seconds
    const newTokens = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefill = now;
  }

  /**
   * Acquires a token from the bucket
   * @returns Promise that resolves when a token is available
   */
  async acquireToken(): Promise<void> {
    this.refillTokens();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Calculate wait time until next token
    const waitTime = ((1 - this.tokens) / this.refillRate) * 1000;
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    // Try again after waiting
    return this.acquireToken();
  }
}

// Create a singleton instance with rate limit from config
export const rateLimiter = new RateLimiter(config.apiRateLimit);

/**
 * Wraps a function with rate limiting
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: Parameters<T>) => {
    await rateLimiter.acquireToken();
    return fn(...args);
  }) as T;
}
