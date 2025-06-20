import { config } from '../config/env';
import { getStockQuote, getStockDetails, getHistoricalPrices } from './stockData';
import {
  mockStockQuote,
  mockStockDetails,
  mockHistoricalPrices,
  mockStockList,
  mockApiResponse,
} from '../mocks/stockData';
import {
  StockQuote,
  StockDetails,
  PriceDataPoint,
  StockAnalysis,
  ApiResponse,
} from '../types/stock';

/**
 * Service layer that switches between mock and real API data
 */
export class StockService {
  /**
   * Fetches stock quote data
   */
  static async getStockQuote(symbol: string): Promise<ApiResponse<StockQuote>> {
    if (config.useMockData) {
      return mockApiResponse(mockStockQuote(symbol));
    }
    return getStockQuote(symbol);
  }

  /**
   * Fetches stock details
   */
  static async getStockDetails(symbol: string): Promise<ApiResponse<StockDetails>> {
    if (config.useMockData) {
      return mockApiResponse(mockStockDetails(symbol));
    }
    return getStockDetails(symbol);
  }

  /**
   * Fetches historical price data
   */
  static async getHistoricalPrices(
    symbol: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<PriceDataPoint[]>> {
    if (config.useMockData) {
      return mockApiResponse(mockHistoricalPrices(symbol, 30));
    }
    return getHistoricalPrices(symbol, startDate, endDate);
  }

  /**
   * Fetches a list of stock analyses
   */
  static async getStockList(count: number = 20): Promise<StockAnalysis[]> {
    console.log('[StockService.getStockList] USE_MOCK_DATA:', config.useMockData);
    if (config.useMockData) {
      return mockStockList(count);
    }

    // --- Real API implementation ---
    // 1. Fetch a list of active US stock tickers from polygon.io
    // 2. For each ticker, fetch quote and details, and build StockAnalysis
    // 3. Return the array (up to count)
    try {
      const { getPolygonTickers } = await import('./stockData');
      const tickers = await getPolygonTickers(count);
      // Fetch quote and details for each ticker in parallel (with some throttling)
      const analyses: (StockAnalysis | null)[] = await Promise.all(
        tickers.map(async (symbol: string) => {
          try {
            const [quoteResp, detailsResp] = await Promise.all([
              StockService.getStockQuote(symbol),
              StockService.getStockDetails(symbol),
            ]);
            // Compose a minimal StockAnalysis (fill in with defaults for missing fields)
            return {
              symbol,
              quote: quoteResp.data,
              details: detailsResp.data,
              volumeAnalysis: {
                averageVolume: quoteResp.data.volume,
                currentVolume: quoteResp.data.volume,
                volumeRatio: 1,
                volumeSpike: false,
              },
              shortInterestAnalysis: {
                shortInterest: detailsResp.data.shortInterest,
                shortInterestRatio: detailsResp.data.shortInterestRatio,
                daysToCover: 0,
                shortInterestPercent: 0,
              },
              recentNews: [],
              recentFilings: [],
              squeezeScore: 0,
              lastUpdated: Date.now(),
            };
          } catch (err) {
            // Skip this symbol if any error
            return null;
          }
        }),
      );
      // Filter out any nulls (failed fetches)
      return analyses.filter((a): a is StockAnalysis => !!a).slice(0, count);
    } catch (err) {
      console.error('Failed to fetch stock list from Polygon.io:', err);
      return [];
    }
  }

  /**
   * Fetches stock analysis for a single stock
   */
  static async getStockAnalysis(symbol: string): Promise<StockAnalysis> {
    if (config.useMockData) {
      // Import the mock function dynamically to avoid circular dependencies
      const { mockStockAnalysis } = await import('../mocks/stockData');
      return mockStockAnalysis(symbol);
    }

    // For real API, we would combine multiple API calls
    // This is a placeholder implementation
    console.warn('Real API stock analysis not fully implemented, using mock data');
    const { mockStockAnalysis } = await import('../mocks/stockData');
    return mockStockAnalysis(symbol);
  }
}
