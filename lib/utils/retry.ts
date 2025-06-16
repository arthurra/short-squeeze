import { config } from '../config/env';
import { ApiError } from '../types/stock';

/**
 * Sleep utility function
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry configuration
 */
interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

/**
 * Default retry configuration based on environment variables
 */
const defaultRetryConfig: RetryConfig = {
  maxAttempts: config.apiRetryAttempts,
  initialDelay: config.apiRetryDelay,
  maxDelay: config.apiRetryDelay * 4,
  backoffFactor: 2,
};

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Network errors and 5xx server errors are retryable
    return (
      error.name === 'NetworkError' || error.name === 'TimeoutError' || (error as any).status >= 500
    );
  }
  return false;
}

/**
 * Executes a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retryConfig: Partial<RetryConfig> = {},
): Promise<T> {
  const config = { ...defaultRetryConfig, ...retryConfig };
  let lastError: unknown;
  let delay = config.initialDelay;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === config.maxAttempts) {
        throw error;
      }

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * config.backoffFactor, config.maxDelay);

      // Log retry attempt
      console.warn(
        `API call failed (attempt ${attempt}/${config.maxAttempts}). Retrying in ${delay}ms...`,
        error,
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Wraps an API call with retry logic and error handling
 */
export async function withApiRetry<T>(
  apiCall: () => Promise<T>,
  errorCode: string,
  errorMessage: string,
): Promise<T> {
  try {
    return await withRetry(apiCall);
  } catch (error) {
    const apiError: ApiError = {
      code: errorCode,
      message: errorMessage,
      details: error,
    };
    throw apiError;
  }
}
