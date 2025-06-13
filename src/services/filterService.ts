import { StockData } from "../lib/types/stock";
import { FilterOptions } from "../lib/types/filters";
import { USExchange } from "../lib/utils/exchangeUtils";

export class FilterService {
  private static instance: FilterService;

  private constructor() {}

  static getInstance(): FilterService {
    if (!FilterService.instance) {
      FilterService.instance = new FilterService();
    }
    return FilterService.instance;
  }

  applyFilters(stocks: StockData[], filters: FilterOptions): StockData[] {
    return stocks.filter((stock) => {
      // Price filters
      if (filters.minPrice !== undefined && stock.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && stock.price > filters.maxPrice) {
        return false;
      }

      // Volume filter
      if (filters.minVolume !== undefined && stock.volume < filters.minVolume) {
        return false;
      }

      // Market cap filter
      if (
        filters.minMarketCap !== undefined &&
        stock.marketCap < filters.minMarketCap
      ) {
        return false;
      }

      // Exchange filter
      if (filters.exchanges !== undefined && filters.exchanges.length > 0) {
        if (!filters.exchanges.includes(stock.exchange as USExchange)) {
          return false;
        }
      }

      // Search term filter
      if (
        filters.searchTerm !== undefined &&
        filters.searchTerm.trim() !== ""
      ) {
        const searchTerm = filters.searchTerm.toLowerCase();
        return (
          stock.symbol.toLowerCase().includes(searchTerm) ||
          stock.name.toLowerCase().includes(searchTerm)
        );
      }

      return true;
    });
  }
}
