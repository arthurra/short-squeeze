/**
 * Environment variable configuration and validation
 */

const requiredEnvVars = ['POLYGON_API_KEY'] as const;

type EnvVar = (typeof requiredEnvVars)[number];

interface Config {
  polygonApiKey: string;
  apiRateLimit: number;
  apiRetryAttempts: number;
  apiRetryDelay: number;
  cacheTTL: number;
}

function validateEnvVar(name: EnvVar): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getNumberEnvVar(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number for environment variable: ${name}`);
  }
  return num;
}

export const config: Config = {
  polygonApiKey: validateEnvVar('POLYGON_API_KEY'),
  apiRateLimit: getNumberEnvVar('API_RATE_LIMIT', 5),
  apiRetryAttempts: getNumberEnvVar('API_RETRY_ATTEMPTS', 3),
  apiRetryDelay: getNumberEnvVar('API_RETRY_DELAY', 1000),
  cacheTTL: getNumberEnvVar('CACHE_TTL', 300),
};

// Validate all required environment variables on startup
export function validateConfig(): void {
  requiredEnvVars.forEach(validateEnvVar);
}
