import { config, validateConfig } from './env';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw error when required env vars are missing', () => {
    delete process.env.POLYGON_API_KEY;
    expect(() => validateConfig()).toThrow(
      'Missing required environment variable: POLYGON_API_KEY',
    );
  });

  it('should use default values for optional numeric env vars', () => {
    process.env.POLYGON_API_KEY = 'test-key';
    expect(config.apiRateLimit).toBe(5);
    expect(config.apiRetryAttempts).toBe(3);
    expect(config.apiRetryDelay).toBe(1000);
    expect(config.cacheTTL).toBe(300);
  });

  it('should parse numeric env vars correctly', () => {
    process.env.POLYGON_API_KEY = 'test-key';
    process.env.API_RATE_LIMIT = '10';
    process.env.API_RETRY_ATTEMPTS = '5';
    process.env.API_RETRY_DELAY = '2000';
    process.env.CACHE_TTL = '600';

    expect(config.apiRateLimit).toBe(10);
    expect(config.apiRetryAttempts).toBe(5);
    expect(config.apiRetryDelay).toBe(2000);
    expect(config.cacheTTL).toBe(600);
  });

  it('should throw error for invalid numeric env vars', () => {
    process.env.POLYGON_API_KEY = 'test-key';
    process.env.API_RATE_LIMIT = 'invalid';
    expect(() => validateConfig()).toThrow(
      'Invalid number for environment variable: API_RATE_LIMIT',
    );
  });
});
