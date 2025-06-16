import { withRetry, withApiRetry } from './retry';
import { ApiError } from '../types/stock';

describe('Retry Utility', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should succeed on first attempt', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const result = await withRetry(mockFn);
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable errors', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('NetworkError'))
      .mockResolvedValueOnce('success');

    const promise = withRetry(mockFn);

    // Fast-forward through the delay
    jest.advanceTimersByTime(1000);

    const result = await promise;
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should not retry on non-retryable errors', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('ValidationError'));

    await expect(withRetry(mockFn)).rejects.toThrow('ValidationError');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should respect max attempts', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('NetworkError'));

    const promise = withRetry(mockFn, { maxAttempts: 2 });

    // Fast-forward through both delays
    jest.advanceTimersByTime(1000);
    jest.advanceTimersByTime(2000);

    await expect(promise).rejects.toThrow('NetworkError');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should wrap errors with ApiError', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('NetworkError'));

    const promise = withApiRetry(mockFn, 'TEST_ERROR', 'Test error message');

    // Fast-forward through the delay
    jest.advanceTimersByTime(1000);

    await expect(promise).rejects.toMatchObject({
      code: 'TEST_ERROR',
      message: 'Test error message',
    });
  });

  it('should use exponential backoff', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('NetworkError'))
      .mockRejectedValueOnce(new Error('NetworkError'))
      .mockResolvedValueOnce('success');

    const promise = withRetry(mockFn, {
      initialDelay: 1000,
      backoffFactor: 2,
    });

    // First retry after 1s
    jest.advanceTimersByTime(1000);
    // Second retry after 2s
    jest.advanceTimersByTime(2000);

    const result = await promise;
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
});
