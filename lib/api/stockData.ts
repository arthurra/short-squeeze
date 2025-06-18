import { restClient } from '@polygon.io/client-js';
import { config } from '../config/env';
import { StockQuote, StockDetails, PriceDataPoint, ApiResponse, ApiError } from '../types/stock';
import { withApiRetry } from '../utils/retry';
import { withRateLimit } from '../utils/rateLimiter';

// Helper to get Polygon.io client (for testability)
function getPolygonClient() {
  return restClient(config.polygonApiKey);
}

/**
 * Fetches real-time quote data for a given stock symbol
 */
export const getStockQuote = withRateLimit(
  async (symbol: string): Promise<ApiResponse<StockQuote>> => {
    return withApiRetry(
      async () => {
        const client = getPolygonClient();
        const response = await client.stocks.lastQuote(symbol);

        // ILastQuote returns ILastTradeInfo in results
        const lastTrade = response.results;

        return {
          data: {
            symbol: symbol,
            price: lastTrade?.p || 0, // price
            volume: lastTrade?.s || 0, // size
            timestamp: typeof lastTrade?.t === 'number' ? lastTrade.t : Date.now(), // timestamp
            change: 0, // Polygon.io doesn't provide change in lastQuote
            changePercent: 0, // Polygon.io doesn't provide changePercent in lastQuote
          },
          timestamp: Date.now(),
        };
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
export const getHistoricalPrices = withRateLimit(
  async (
    symbol: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<PriceDataPoint[]>> => {
    return withApiRetry(
      async () => {
        const client = getPolygonClient();
        const response = await client.stocks.aggregates(symbol, 1, 'day', startDate, endDate);

        return {
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
      },
      'HISTORICAL_FETCH_ERROR',
      `Failed to fetch historical prices for ${symbol}`,
    );
  },
);
