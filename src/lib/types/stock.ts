/**
 * Core stock data types and interfaces
 */

/**
 * Basic stock quote information
 */
export interface StockQuote {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  change: number;
  changePercent: number;
}

/**
 * Detailed stock information
 */
export interface StockDetails {
  symbol: string;
  name: string;
  marketCap: number;
  sector: string;
  industry: string;
  shortInterest: number;
  shortInterestRatio: number;
}

/**
 * Historical price data point
 */
export interface PriceDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Historical price data for a stock
 */
export interface HistoricalPrices {
  symbol: string;
  timeframe: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
  data: PriceDataPoint[];
}

/**
 * Volume analysis data
 */
export interface VolumeAnalysis {
  averageVolume: number;
  currentVolume: number;
  volumeRatio: number;
  volumeSpike: boolean;
}

/**
 * Short interest analysis
 */
export interface ShortInterestAnalysis {
  shortInterest: number;
  shortInterestRatio: number;
  daysToCover: number;
  shortInterestPercent: number;
}

/**
 * News article related to a stock
 */
export interface StockNews {
  id: string;
  title: string;
  url: string;
  publishedAt: number;
  source: string;
  summary: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

/**
 * SEC filing information
 */
export interface SECFiling {
  id: string;
  type: string;
  title: string;
  url: string;
  filedAt: number;
  description: string;
}

/**
 * Comprehensive stock analysis
 */
export interface StockAnalysis {
  symbol: string;
  quote: StockQuote;
  details: StockDetails;
  volumeAnalysis: VolumeAnalysis;
  shortInterestAnalysis: ShortInterestAnalysis;
  recentNews: StockNews[];
  recentFilings: SECFiling[];
  squeezeScore: number; // 0-100 score indicating potential for short squeeze
  lastUpdated: number;
}

/**
 * Filter criteria for stock screening
 */
export interface StockFilter {
  minPrice?: number;
  maxPrice?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minVolume?: number;
  minVolumeRatio?: number;
  minShortInterest?: number;
  sectors?: string[];
  industries?: string[];
  minSqueezeScore?: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
  timestamp: number;
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
