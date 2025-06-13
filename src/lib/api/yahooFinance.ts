import { StockData } from "../types/stock";
import { API_CONFIG } from "../../config/api";
import { DataCache } from "../cache/dataCache";

export interface YahooFinanceQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  marketCap: number;
}

export class YahooFinanceAPI {
  private static instance: YahooFinanceAPI;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly rateLimit: number;
  private lastRequestTime: number;
  private cache: DataCache;

  private constructor() {
    this.apiKey = API_CONFIG.yahooFinance.apiKey;
    this.baseUrl = API_CONFIG.yahooFinance.baseUrl;
    this.rateLimit =
      API_CONFIG.yahooFinance.rateLimit.requestsPerMinute * 60 * 1000; // Convert to milliseconds
    this.lastRequestTime = 0;
    this.cache = DataCache.getInstance();
  }

  public static getInstance(): YahooFinanceAPI {
    if (!YahooFinanceAPI.instance) {
      YahooFinanceAPI.instance = new YahooFinanceAPI();
    }
    return YahooFinanceAPI.instance;
  }

  private async delay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimit) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.rateLimit - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  async getQuote(symbol: string): Promise<StockData | null> {
    // Check cache first
    const cachedData = this.cache.get(symbol);
    if (cachedData) {
      return cachedData;
    }

    await this.delay();

    try {
      const response = await fetch(
        `${this.baseUrl}/v8/finance/chart/${symbol}`,
        {
          headers: {
            "x-api-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const quote = data.chart.result[0].meta;

      const stockData: StockData = {
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

      // Cache the result
      this.cache.set(symbol, stockData);

      return stockData;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  public async getStockUniverse(): Promise<StockData[]> {
    // TODO: Implement actual API call
    // For now, return sample data
    return [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 150.25,
        change: 2.5,
        changePercent: 1.69,
        volume: 1000000,
        marketCap: 2500000000000,
        exchange: "NASDAQ",
        lastUpdated: new Date().toISOString(),
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        price: 280.75,
        change: -1.25,
        changePercent: -0.44,
        volume: 800000,
        marketCap: 2100000000000,
        exchange: "NASDAQ",
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  public async getStockDetails(symbol: string): Promise<StockData> {
    // TODO: Implement actual API call
    // For now, return sample data
    return {
      symbol,
      name: `${symbol} Company`,
      price: 100.0,
      change: 0.0,
      changePercent: 0.0,
      volume: 500000,
      marketCap: 1000000000,
      exchange: "NASDAQ",
      lastUpdated: new Date().toISOString(),
    };
  }
}
