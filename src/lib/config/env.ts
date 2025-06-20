/**
 * Environment variable configuration and validation
 */

const requiredEnvVars = ['POLYGON_API_KEY'] as const;

type EnvVar = (typeof requiredEnvVars)[number];

interface Config {
  polygonApiKey: string | null;
  apiRateLimit: number;
  apiRetryAttempts: number;
  apiRetryDelay: number;
  cacheTTL: number;
  useMockData: boolean;
}

function getEnvVar(name: string): string | null {
  return process.env[name] || null;
}

function validateEnvVar(name: EnvVar): string {
  const value = getEnvVar(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getNumberEnvVar(name: string, defaultValue: number): number {
  const value = getEnvVar(name);
  if (!value) return defaultValue;
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number for environment variable: ${name}`);
  }
  return num;
}

function getBooleanEnvVar(name: string, defaultValue: boolean): boolean {
  const value = getEnvVar(name);
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

export const config: Config = {
  polygonApiKey: getEnvVar('POLYGON_API_KEY'),
  apiRateLimit: getNumberEnvVar('API_RATE_LIMIT', 5),
  apiRetryAttempts: getNumberEnvVar('API_RETRY_ATTEMPTS', 3),
  apiRetryDelay: getNumberEnvVar('API_RETRY_DELAY', 1000),
  cacheTTL: getNumberEnvVar('CACHE_TTL', 300),
  useMockData: getBooleanEnvVar('USE_MOCK_DATA', true),
};

// Validate all required environment variables on startup
export function validateConfig(): void {
  requiredEnvVars.forEach(validateEnvVar);
}

// Get API key with validation - only call this when actually using real API
export function getPolygonApiKey(): string {
  if (config.useMockData) {
    throw new Error('API key not required when using mock data');
  }

  if (!config.polygonApiKey) {
    throw new Error('Missing required environment variable: POLYGON_API_KEY');
  }

  return config.polygonApiKey;
}
