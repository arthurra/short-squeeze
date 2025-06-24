import { restClient } from '@polygon.io/client-js';
import { getPolygonApiKey } from '../config/env';
import { StockQuote, StockDetails, PriceDataPoint, ApiResponse, ApiError } from '../types/stock';
import { withApiRetry } from '../utils/retry';
import { withRateLimit } from '../utils/rateLimiter';
import { getCachedData, setCachedData } from '../kv';

// Helper to get Polygon.io client (for testability)
function getPolygonClient() {
  return restClient(getPolygonApiKey());
}

/**
 * Fetches real-time quote data for a given stock symbol
 */
export const getStockQuote = withRateLimit(
  async (symbol: string): Promise<ApiResponse<StockQuote>> => {
    return withApiRetry(
      async () => {
        let client;
        try {
          client = getPolygonClient();
        } catch (err) {
          throw err;
        }
        try {
          const response = await client.stocks.lastQuote(symbol);
          const lastTrade = response.results;
          return {
            data: {
              symbol: symbol,
              price: lastTrade?.p || 0,
              volume: lastTrade?.s || 0,
              timestamp: typeof lastTrade?.t === 'number' ? lastTrade.t : Date.now(),
              change: 0,
              changePercent: 0,
            },
            timestamp: Date.now(),
          };
        } catch (err) {
          throw err;
        }
      },
      'QUOTE_FETCH_ERROR',
      `Failed to fetch quote for ${symbol}`,
    );
  },
);

/**
 * Fetches detailed information about a stock
 */
export const getStockDetails = withRateLimit(
  async (symbol: string): Promise<ApiResponse<StockDetails>> => {
    return withApiRetry(
      async () => {
        const client = getPolygonClient();
        const tickerDetails = await client.reference.tickerDetails(symbol);

        return {
          data: {
            symbol: tickerDetails.results?.ticker || symbol,
            name: tickerDetails.results?.name || symbol,
            marketCap: tickerDetails.results?.market_cap || 0,
            sector: tickerDetails.results?.sic_description || 'Unknown',
            industry: tickerDetails.results?.sic_description || 'Unknown',
            shortInterest: 0, // Polygon.io doesn't provide short interest data
            shortInterestRatio: 0, // Polygon.io doesn't provide short interest ratio
          },
          timestamp: Date.now(),
        };
      },
      'DETAILS_FETCH_ERROR',
      `Failed to fetch details for ${symbol}`,
    );
  },
);

/**
 * Fetches historical price data for a stock
 */
export const getHistoricalPrices = async (
  symbol: string,
  startDate: string,
  endDate: string,
): Promise<ApiResponse<PriceDataPoint[]>> => {
  const cacheKey = `stock:history:${symbol}:${startDate}:${endDate}`;
  // Try to get from cache
  const cached = await getCachedData<ApiResponse<PriceDataPoint[]>>(cacheKey);
  if (cached) {
    return cached;
  }
  // If not cached, fetch from Polygon
  const client = getPolygonClient();
  const response = await client.stocks.aggregates(symbol, 1, 'day', startDate, endDate);
  const result: ApiResponse<PriceDataPoint[]> = {
    data: (response.results || []).map((point: any) => ({
      timestamp: point.t,
      open: point.o,
      high: point.h,
      low: point.l,
      close: point.c,
      volume: point.v,
    })),
    timestamp: Date.now(),
  };
  // Cache the result for 24 hours (86400 seconds)
  await setCachedData(cacheKey, result, 86400);
  return result;
};

// Fetch a list of active US stock tickers from Polygon.io (for use in StockService)
export async function getPolygonTickers(count: number): Promise<string[]> {
  const client = getPolygonClient();
  // Use the reference.tickers method with correct params
  const params = {
    market: 'stocks' as any, // cast to any if type expects enum
    active: 'true' as 'true', // use string literal type 'true'
    type: 'CS' as any, // cast to any if type expects enum
    limit: Math.min(count, 1000),
  };
  const response = await client.reference.tickers(params);
  if (!response.results || !Array.isArray(response.results)) {
    throw new Error('Unexpected response from Polygon tickers endpoint');
  }
  return response.results.slice(0, count).map((t: any) => t.ticker);
}
