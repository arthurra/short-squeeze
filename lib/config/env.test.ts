import { expect, jest, describe, it, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import { config, validateConfig, getPolygonApiKey } from './env';

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
      USE_MOCK_DATA: 'true',
    };
  });

  it('should parse numeric env vars correctly', () => {
    expect(config.apiRateLimit).toBe(5);
    expect(config.apiRetryAttempts).toBe(3);
    expect(config.apiRetryDelay).toBe(1000);
    expect(config.cacheTTL).toBe(300);
  });

  it('should parse boolean env vars correctly', () => {
    expect(config.useMockData).toBe(true);

    process.env.USE_MOCK_DATA = 'false';
    jest.resetModules();
    const { config: newConfig } = require('./env');
    expect(newConfig.useMockData).toBe(false);
  });

  it('should handle missing API key when using mock data', () => {
    delete process.env.POLYGON_API_KEY;
    jest.resetModules();
    const { config: newConfig } = require('./env');
    expect(newConfig.polygonApiKey).toBeNull();
  });

  it('should get API key when available and not using mock data', () => {
    process.env.USE_MOCK_DATA = 'false';
    process.env.POLYGON_API_KEY = 'test-key';
    jest.resetModules();
    const { getPolygonApiKey: newGetPolygonApiKey } = require('./env');
    expect(newGetPolygonApiKey()).toBe('test-key');
  });

  it('should throw error when API key is missing and not using mock data', () => {
    process.env.USE_MOCK_DATA = 'false';
    delete process.env.POLYGON_API_KEY;
    jest.resetModules();
    const { getPolygonApiKey: newGetPolygonApiKey } = require('./env');
    expect(() => newGetPolygonApiKey()).toThrow(
      'Missing required environment variable: POLYGON_API_KEY',
    );
  });

  it('should throw error when trying to get API key while using mock data', () => {
    process.env.USE_MOCK_DATA = 'true';
    jest.resetModules();
    const { getPolygonApiKey: newGetPolygonApiKey } = require('./env');
    expect(() => newGetPolygonApiKey()).toThrow('API key not required when using mock data');
  });

  it('should throw error for invalid numeric env vars', async () => {
    process.env.API_RATE_LIMIT = 'invalid';
    // Defer import to after env var is set
    jest.resetModules();
    await expect(async () => {
      const { config } = await import('./env');
      return config.apiRateLimit;
    }).rejects.toThrow('Invalid number for environment variable: API_RATE_LIMIT');
  });

  it('should throw error for missing required env vars in validateConfig', () => {
    delete process.env.POLYGON_API_KEY;
    expect(() => validateConfig()).toThrow(
      'Missing required environment variable: POLYGON_API_KEY',
    );
  });
});
