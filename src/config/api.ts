export interface ApiConfig {
  yahooFinance: {
    apiKey: string;
    baseUrl: string;
    rateLimit: {
      requestsPerMinute: number;
      requestsPerDay: number;
    };
  };
  polygon: {
    apiKey: string;
    baseUrl: string;
    rateLimit: {
      requestsPerMinute: number;
      requestsPerDay: number;
    };
  };
}

// Default configuration
export const API_CONFIG = {
  yahooFinance: {
    apiKey: import.meta.env.VITE_YAHOO_FINANCE_API_KEY,
    baseUrl: "https://api.yahoo.com/v1",
    rateLimit: {
      requestsPerMinute: 2000,
      requestsPerDay: 100000,
    },
  },
  polygon: {
    apiKey: import.meta.env.VITE_POLYGON_API_KEY,
    baseUrl: "https://api.polygon.io/v2",
    rateLimit: {
      requestsPerMinute: 5,
      requestsPerDay: 1000,
    },
  },
};
