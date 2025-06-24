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
  StockNews,
  SECFiling,
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

    // --- Refactored API implementation using Polygon.io full market snapshot ---
    try {
      const apiKey = config.polygonApiKey || process.env.POLYGON_API_KEY;
      const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?apiKey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch market snapshot');
      const data = await response.json();
      if (!data.tickers || !Array.isArray(data.tickers))
        throw new Error('Invalid snapshot response');
      // Limit to requested count
      const tickers = data.tickers.slice(0, count);
      // Map snapshot data to StockAnalysis
      return tickers.map((t: any): StockAnalysis => {
        // Fallbacks for missing data
        const symbol = t.ticker;
        const price = t.lastTrade?.p ?? t.day?.c ?? 0;
        const volume = t.day?.v ?? 0;
        const marketCap = t.marketCap ?? 0;
        return {
          symbol,
          quote: {
            symbol,
            price,
            volume,
            timestamp: t.updated ?? Date.now(),
            change: t.todaysChange ?? 0,
            changePercent: t.todaysChangePerc ?? 0,
          },
          details: {
            symbol,
            name: symbol, // Name not available in snapshot
            marketCap,
            sector: 'Unknown', // Not available in snapshot
            industry: 'Unknown', // Not available in snapshot
            shortInterest: 0, // Not available in snapshot
            shortInterestRatio: 0, // Not available in snapshot
          },
          volumeAnalysis: {
            averageVolume: volume,
            currentVolume: volume,
            volumeRatio: 1,
            volumeSpike: false,
          },
          shortInterestAnalysis: {
            shortInterest: 0,
            shortInterestRatio: 0,
            daysToCover: 0,
            shortInterestPercent: 0,
          },
          recentNews: [],
          recentFilings: [],
          squeezeScore: 0,
          lastUpdated: t.updated ?? Date.now(),
        };
      });
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

    // Fetch historical prices for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    const format = (d: Date) => d.toISOString().slice(0, 10);
    const historicalResp = await this.getHistoricalPrices(
      symbol,
      format(startDate),
      format(endDate),
    );
    const historicalPrices = historicalResp.data;

    // Use the most recent aggregate as the 'quote'
    const latest = historicalPrices[historicalPrices.length - 1];
    const quote = latest
      ? {
          symbol,
          price: latest.close,
          volume: latest.volume,
          timestamp: latest.timestamp,
          change: 0,
          changePercent: 0,
        }
      : {
          symbol,
          price: 0,
          volume: 0,
          timestamp: Date.now(),
          change: 0,
          changePercent: 0,
        };

    // Fetch details as before
    const detailsResp = await this.getStockDetails(symbol);
    const details = detailsResp.data;

    // Calculate volume analysis
    const volumes = historicalPrices.map((p) => p.volume);
    const averageVolume =
      volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0;
    const volumeAnalysis = {
      averageVolume,
      currentVolume: quote.volume,
      volumeRatio: averageVolume > 0 ? quote.volume / averageVolume : 0,
      volumeSpike: averageVolume > 0 ? quote.volume / averageVolume > 2 : false,
    };

    // Calculate short interest analysis (Polygon does not provide real data, so use 0s)
    const shortInterestAnalysis = {
      shortInterest: details.shortInterest || 0,
      shortInterestRatio: details.shortInterestRatio || 0,
      daysToCover: 0,
      shortInterestPercent: 0,
    };

    // Squeeze score (use your existing utility if available, else set to 0)
    let squeezeScore = 0;
    try {
      const { calculateSqueezeSignal } = await import('../utils/squeezeScore');
      squeezeScore = calculateSqueezeSignal({
        currentVolume: quote.volume,
        priceHistory: historicalPrices,
        shortInterestPercent: shortInterestAnalysis.shortInterestPercent,
        marketCap: details.marketCap,
        avgVolume: volumeAnalysis.averageVolume,
        recentFilings: [],
        recentNews: [],
        recentSocialPosts: [],
      });
    } catch {
      squeezeScore = 0;
    }

    // News and filings (not available from Polygon, so leave empty)
    const recentNews: StockNews[] = [];
    const recentFilings: SECFiling[] = [];

    return {
      symbol,
      quote,
      details,
      volumeAnalysis,
      shortInterestAnalysis,
      recentNews,
      recentFilings,
      squeezeScore,
      lastUpdated: Date.now(),
    };
  }
}
