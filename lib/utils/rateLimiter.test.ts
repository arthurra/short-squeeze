import { expect, jest, describe, it } from '@jest/globals';
import '@testing-library/jest-dom';
import { RateLimiter } from './rateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow requests within rate limit', async () => {
    const limiter = new RateLimiter(2, 1000); // 2 requests per second
    const fn = jest.fn().mockResolvedValue('success');

    const result1 = await limiter.execute(fn);
    const result2 = await limiter.execute(fn);

    expect(result1).toBe('success');
    expect(result2).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should queue requests when rate limit is exceeded', async () => {
    const limiter = new RateLimiter(1, 1000); // 1 request per second
    const fn = jest.fn().mockResolvedValue('success');

    const promise1 = limiter.execute(fn);
    const promise2 = limiter.execute(fn);

    expect(fn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(result1).toBe('success');
    expect(result2).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should handle errors properly', async () => {
    const limiter = new RateLimiter(1, 1000);
    const error = new Error('Test error');
    const fn = jest.fn().mockRejectedValue(error);

    await expect(limiter.execute(fn)).rejects.toThrow('Test error');
  });

  it('should reset after window period', async () => {
    const limiter = new RateLimiter(1, 1000);
    const fn = jest.fn().mockResolvedValue('success');

    await limiter.execute(fn);
    jest.advanceTimersByTime(1000);
    await limiter.execute(fn);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
