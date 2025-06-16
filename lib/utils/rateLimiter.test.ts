import { RateLimiter } from './rateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow requests within rate limit', async () => {
    const limiter = new RateLimiter(2); // 2 requests per second

    // First request should succeed immediately
    const promise1 = limiter.acquireToken();
    jest.advanceTimersByTime(0);
    await expect(promise1).resolves.toBeUndefined();

    // Second request should also succeed immediately
    const promise2 = limiter.acquireToken();
    jest.advanceTimersByTime(0);
    await expect(promise2).resolves.toBeUndefined();
  });

  it('should throttle requests exceeding rate limit', async () => {
    const limiter = new RateLimiter(1); // 1 request per second

    // First request should succeed immediately
    const promise1 = limiter.acquireToken();
    jest.advanceTimersByTime(0);
    await expect(promise1).resolves.toBeUndefined();

    // Second request should be delayed
    const promise2 = limiter.acquireToken();
    jest.advanceTimersByTime(0);
    expect(promise2).not.toBeResolved();

    // Advance time to allow the second request
    jest.advanceTimersByTime(1000);
    await expect(promise2).resolves.toBeUndefined();
  });

  it('should refill tokens over time', async () => {
    const limiter = new RateLimiter(1); // 1 request per second

    // Use up the initial token
    await limiter.acquireToken();

    // Advance time by 1.5 seconds
    jest.advanceTimersByTime(1500);

    // Should be able to make 1 request immediately
    const promise = limiter.acquireToken();
    jest.advanceTimersByTime(0);
    await expect(promise).resolves.toBeUndefined();
  });

  it('should not exceed max tokens', async () => {
    const limiter = new RateLimiter(1); // 1 request per second

    // Advance time by 5 seconds
    jest.advanceTimersByTime(5000);

    // Should only be able to make 1 request immediately
    const promise1 = limiter.acquireToken();
    jest.advanceTimersByTime(0);
    await expect(promise1).resolves.toBeUndefined();

    // Second request should be delayed
    const promise2 = limiter.acquireToken();
    jest.advanceTimersByTime(0);
    expect(promise2).not.toBeResolved();
  });

  it('should handle multiple concurrent requests', async () => {
    const limiter = new RateLimiter(2); // 2 requests per second

    const promises = Array(4)
      .fill(null)
      .map(() => limiter.acquireToken());

    // First two should resolve immediately
    jest.advanceTimersByTime(0);
    await expect(Promise.all(promises.slice(0, 2))).resolves.toBeDefined();

    // Next two should be delayed
    expect(promises[2]).not.toBeResolved();
    expect(promises[3]).not.toBeResolved();

    // Advance time to allow remaining requests
    jest.advanceTimersByTime(1000);
    await expect(Promise.all(promises.slice(2))).resolves.toBeDefined();
  });
});
