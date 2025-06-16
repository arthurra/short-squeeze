import { StockData } from "../lib/types/stock";
import { YahooFinanceAPI } from "../lib/api/yahooFinance";
import { PolygonAPI } from "../lib/api/polygon";
import { FilterService } from "./filterService";
import { FilterOptions } from "../lib/types/filters";
import { DataCache } from "../lib/cache/dataCache";

export class StockDataService {
  private static instance: StockDataService;
  private yahooFinance: YahooFinanceAPI;
  private polygon: PolygonAPI;
  private filterService: FilterService;
  private cache: DataCache;

  private constructor() {
    this.yahooFinance = YahooFinanceAPI.getInstance();
    this.polygon = PolygonAPI.getInstance();
    this.filterService = FilterService.getInstance();
    this.cache = DataCache.getInstance();
  }

  static getInstance(): StockDataService {
    if (!StockDataService.instance) {
      StockDataService.instance = new StockDataService();
    }
    return StockDataService.instance;
  }

  async getStockData(symbol: string): Promise<StockData | null> {
    try {
      // Try Yahoo Finance first
      const yahooData = await this.yahooFinance.getQuote(symbol);
      if (yahooData) {
        return yahooData;
      }

      // Fallback to Polygon
      const polygonData = await this.polygon.getQuote(symbol);
      if (polygonData) {
        return polygonData;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error);
      return null;
    }
  }

  async getStockUniverse(): Promise<StockData[]> {
    try {
      const cachedData = this.cache.get<StockData[]>("stockUniverse");
      if (cachedData) {
        return cachedData;
      }

      const yahooStocks = await this.yahooFinance.getStockUniverse();
      const polygonStocks = await this.polygon.getStockUniverse();

      // Merge and deduplicate stocks
      const mergedStocks = this.mergeStockData(yahooStocks, polygonStocks);
      this.cache.set("stockUniverse", mergedStocks);
      return mergedStocks;
    } catch (error) {
      console.error("Error fetching stock universe:", error);
      throw error;
    }
  }

  async getFilteredStocks(filters: FilterOptions): Promise<StockData[]> {
    const stocks = await this.getStockUniverse();
    return stocks.filter((stock) => {
      if (filters.minPrice && stock.price < filters.minPrice) return false;
      if (filters.maxPrice && stock.price > filters.maxPrice) return false;
      if (filters.minVolume && stock.volume < filters.minVolume) return false;
      if (filters.minMarketCap && stock.marketCap < filters.minMarketCap)
        return false;
      if (
        filters.exchanges &&
        filters.exchanges.length > 0 &&
        !filters.exchanges.includes(stock.exchange)
      )
        return false;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          stock.symbol.toLowerCase().includes(searchLower) ||
          stock.name.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }

  private mergeStockData(
    yahooStocks: StockData[],
    polygonStocks: StockData[]
  ): StockData[] {
    const stockMap = new Map<string, StockData>();

    // Add Yahoo Finance stocks
    yahooStocks.forEach((stock) => {
      stockMap.set(stock.symbol, stock);
    });

    // Merge Polygon data
    polygonStocks.forEach((stock) => {
      const existingStock = stockMap.get(stock.symbol);
      if (existingStock) {
        // Merge data, preferring Polygon data for certain fields
        stockMap.set(stock.symbol, {
          ...existingStock,
          ...stock,
          // Keep Yahoo Finance data for fields not provided by Polygon
          name: existingStock.name || stock.name,
          exchange: existingStock.exchange || stock.exchange,
        });
      } else {
        stockMap.set(stock.symbol, stock);
      }
    });

    return Array.from(stockMap.values());
  }
}
