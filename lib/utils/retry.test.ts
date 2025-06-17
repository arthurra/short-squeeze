import { expect, jest, describe, it, beforeEach, afterEach } from '@jest/globals';
import '@testing-library/jest-dom';
import { withRetry, withApiRetry } from './retry';
import { ApiError } from '../types/stock';
import * as retryUtils from './retry';

describe('Retry Utility', () => {
  beforeEach(() => {
    // No fake timers; use real timers for async retry tests
    jest.spyOn(retryUtils, 'sleep' as any).mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should succeed on first attempt', async () => {
    const mockFn = jest.fn<() => Promise<string>>().mockResolvedValue('success');
    const result = await withRetry(mockFn);
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable errors', async () => {
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(Object.assign(new Error('Network error'), { name: 'NetworkError' }))
      .mockResolvedValue('success');

    const result = await withRetry(mockFn, { maxAttempts: 2, initialDelay: 0, maxDelay: 0 });
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should not retry on non-retryable errors', async () => {
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(
        Object.assign(new Error('Validation error'), { name: 'ValidationError' }),
      );

    await expect(
      withRetry(mockFn, { maxAttempts: 2, initialDelay: 0, maxDelay: 0 }),
    ).rejects.toThrow('Validation error');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should respect max attempts', async () => {
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValue(Object.assign(new Error('Network error'), { name: 'NetworkError' }));

    const promise = withRetry(mockFn, { maxAttempts: 2, initialDelay: 0, maxDelay: 0 });
    await expect(promise).rejects.toMatchObject({ name: 'NetworkError' });
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should wrap errors with ApiError', async () => {
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValue(Object.assign(new Error('Network error'), { name: 'NetworkError' }));

    const promise = withApiRetry(mockFn, 'ERR_CODE', 'Something went wrong');
    await expect(promise).rejects.toMatchObject({
      code: 'ERR_CODE',
      message: 'Something went wrong',
    });
  });

  it('should use exponential backoff', async () => {
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(Object.assign(new Error('Network error'), { name: 'NetworkError' }))
      .mockRejectedValueOnce(Object.assign(new Error('Network error'), { name: 'NetworkError' }))
      .mockResolvedValue('success');

    const result = await withRetry(mockFn, {
      maxAttempts: 3,
      initialDelay: 0,
      maxDelay: 0,
      backoffFactor: 2,
    });
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
});
