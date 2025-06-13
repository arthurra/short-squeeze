import { StockData } from "../lib/types/stock";
import { YahooFinanceQuote } from "../lib/api/yahooFinance";
import { PolygonQuote } from "../lib/api/polygon";

interface FallbackData {
  quotes: Map<string, YahooFinanceQuote | PolygonQuote>;
  lastUpdated: number;
}

export class FallbackDataService {
  private static instance: FallbackDataService;
  private fallbackData: FallbackData;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.fallbackData = {
      quotes: new Map(),
      lastUpdated: 0,
    };
  }

  static getInstance(): FallbackDataService {
    if (!FallbackDataService.instance) {
      FallbackDataService.instance = new FallbackDataService();
    }
    return FallbackDataService.instance;
  }

  async getFallbackQuote(symbol: string): Promise<StockData | null> {
    const now = Date.now();

    // Check if fallback data is expired
    if (now - this.fallbackData.lastUpdated > this.CACHE_DURATION) {
      return null;
    }

    const quote = this.fallbackData.quotes.get(symbol);
    if (!quote) {
      return null;
    }

    // Transform the quote to StockData format
    if ("regularMarketPrice" in quote) {
      // Yahoo Finance quote
      return {
        symbol: quote.symbol,
        name: quote.symbol, // TODO: Get company name from API
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        exchange: "NASDAQ", // TODO: Get exchange from API
        lastUpdated: new Date(),
      };
    } else {
      // Polygon quote
      return {
        symbol: quote.symbol,
        name: quote.symbol, // TODO: Get company name from API
        price: quote.lastPrice,
        change: 0, // TODO: Calculate from historical data
        changePercent: 0, // TODO: Calculate from historical data
        volume: quote.volume,
        marketCap: quote.marketCap,
        exchange: "NASDAQ", // TODO: Get exchange from API
        lastUpdated: new Date(),
      };
    }
  }

  updateFallbackData(
    quotes: Map<string, YahooFinanceQuote | PolygonQuote>
  ): void {
    this.fallbackData = {
      quotes: new Map(quotes),
      lastUpdated: Date.now(),
    };
  }

  isFallbackDataValid(): boolean {
    const now = Date.now();
    return now - this.fallbackData.lastUpdated <= this.CACHE_DURATION;
  }

  clearFallbackData(): void {
    this.fallbackData = {
      quotes: new Map(),
      lastUpdated: 0,
    };
  }
}
