import { USExchange } from "../utils/exchangeUtils";

export interface HistoricalDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  exchange: string;
  lastUpdated: string;
}

export interface StockUniverse {
  stocks: StockData[];
  lastUpdated: Date;
}
