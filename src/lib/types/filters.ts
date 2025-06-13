import { USExchange } from "../utils/exchangeUtils";

export interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  minVolume?: number;
  minMarketCap?: number;
  exchanges?: string[];
  searchTerm?: string;
}
