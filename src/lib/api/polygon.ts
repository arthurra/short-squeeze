import { StockData } from "../types/stock";
import { API_CONFIG } from "../../config/api";
import { DataCache } from "../cache/dataCache";

export interface PolygonQuote {
  symbol: string;
  lastPrice: number;
  volume: number;
  marketCap: number;
}

export class PolygonAPI {
  private static instance: PolygonAPI;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly rateLimit: number;
  private lastRequestTime: number;
  private cache: DataCache;

  private constructor() {
    this.apiKey = API_CONFIG.polygon.apiKey;
    this.baseUrl = API_CONFIG.polygon.baseUrl;
    this.rateLimit = API_CONFIG.polygon.rateLimit.requestsPerMinute * 60 * 1000; // Convert to milliseconds
    this.lastRequestTime = 0;
    this.cache = DataCache.getInstance();
  }

  static getInstance(): PolygonAPI {
    if (!PolygonAPI.instance) {
      PolygonAPI.instance = new PolygonAPI();
    }
    return PolygonAPI.instance;
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
      const response = await fetch(`${this.baseUrl}/v2/last/trade/${symbol}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const quote = data.results;

      const stockData: StockData = {
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

      // Cache the result
      this.cache.set(symbol, stockData);

      return stockData;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  async getStockUniverse(): Promise<StockData[]> {
    // TODO: Implement actual API call
    // For now, return sample data
    return [
      {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        price: 2750.5,
        change: 15.25,
        changePercent: 0.56,
        volume: 1200000,
        marketCap: 1850000000000,
        exchange: "NASDAQ",
        lastUpdated: new Date().toISOString(),
      },
      {
        symbol: "AMZN",
        name: "Amazon.com Inc.",
        price: 3300.75,
        change: -25.5,
        changePercent: -0.77,
        volume: 900000,
        marketCap: 1650000000000,
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
