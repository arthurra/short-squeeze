import { createClient } from '@polygon.io/client-js';
import { config } from '../config/env';
import { StockQuote, StockDetails, PriceDataPoint, ApiResponse, ApiError } from '../types/stock';
import { withApiRetry } from '../utils/retry';
import { withRateLimit } from '../utils/rateLimiter';

// Initialize Polygon.io client with validated API key
const polygonClient = createClient(config.polygonApiKey);

/**
 * Fetches real-time quote data for a given stock symbol
 */
export const getStockQuote = withRateLimit(
  async (symbol: string): Promise<ApiResponse<StockQuote>> => {
    return withApiRetry(
      async () => {
        const response = await polygonClient.stocks.lastQuote(symbol);
        return {
          data: {
            symbol: response.symbol,
            price: response.lastPrice,
            volume: response.lastSize,
            timestamp: response.timestamp,
            change: response.change,
            changePercent: response.changePercent,
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
        const [tickerDetails, shortInterest] = await Promise.all([
          polygonClient.reference.tickerDetails(symbol),
          polygonClient.reference.shortInterest(symbol),
        ]);

        return {
          data: {
            symbol: tickerDetails.symbol,
            name: tickerDetails.name,
            marketCap: tickerDetails.marketCap,
            sector: tickerDetails.sector,
            industry: tickerDetails.industry,
            shortInterest: shortInterest.shortInterest,
            shortInterestRatio: shortInterest.shortInterestRatio,
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
        const response = await polygonClient.stocks.aggregates(
          symbol,
          1,
          'day',
          startDate,
          endDate,
        );
        return {
          data: response.results.map((point: any) => ({
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
