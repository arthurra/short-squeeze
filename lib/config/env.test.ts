import { expect, jest, describe, it, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import { config, validateConfig } from './env';

describe('Environment Configuration', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    process.env = {
      ...process.env,
      POLYGON_API_KEY: 'test-key',
      API_RATE_LIMIT: '5',
      API_RETRY_ATTEMPTS: '3',
      API_RETRY_DELAY: '1000',
      CACHE_TTL: '300',
    };
  });

  it('should parse numeric env vars correctly', () => {
    expect(config.apiRateLimit).toBe(5);
    expect(config.apiRetryAttempts).toBe(3);
    expect(config.apiRetryDelay).toBe(1000);
    expect(config.cacheTTL).toBe(300);
  });

  it('should throw error for invalid numeric env vars', () => {
    process.env.API_RATE_LIMIT = 'invalid';
    // Defer import to after env var is set
    jest.resetModules();
    expect(() => {
      // eslint-disable-next-line
      require('./env').config.apiRateLimit;
    }).toThrow('Invalid number for environment variable: API_RATE_LIMIT');
  });

  it('should throw error for missing required env vars', () => {
    delete process.env.POLYGON_API_KEY;
    expect(() => validateConfig()).toThrow(
      'Missing required environment variable: POLYGON_API_KEY',
    );
  });
});
