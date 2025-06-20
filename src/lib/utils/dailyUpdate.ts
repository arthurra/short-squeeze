import { config } from '../config/env';
import { StockAnalysis, ApiResponse } from '../types/stock';
import { withApiRetry } from './retry';
import { withRateLimit } from './rateLimiter';
import { cacheManager, CACHE_KEYS, CACHE_TTL } from './cache';
import { storeHistoricalData } from './historicalData';
import {
  validateStockQuote,
  validateStockDetails,
  validatePriceDataPoint,
  validateVolumeAnalysis,
  validateShortInterestAnalysis,
  validateStockAnalysis,
} from './validation';
import { createBackup, cleanupOldBackups } from './backup';
import { StockQuote, StockDetails, PriceDataPoint } from '../types/stock';
import { mockPolygonClient } from '../mocks/polygonClient';

interface IAggs {
  results: Array<{
    v: number;
    t: number;
    o: number;
    h: number;
    l: number;
    c: number;
  }>;
}

interface ILastQuote {
  lastPrice: number;
  lastSize: number;
  timestamp: number;
  change: number;
  changePercent: number;
}

interface ITickerDetails {
  name: string;
  marketCap: number;
  sector: string;
  industry: string;
  shortInterest: number;
  shortInterestRatio: number;
}

/**
 * Checks if data needs to be updated based on last update time
 */
export async function shouldUpdateData(): Promise<boolean> {
  const lastUpdate = await cacheManager.get<number>(CACHE_KEYS.LAST_UPDATE);
  if (!lastUpdate) return true;

  const now = Date.now();
  const oneDayInMs = 24 * 60 * 60 * 1000;
  return now - lastUpdate >= oneDayInMs;
}

/**
 * Updates stock data and creates a backup
 */
export async function updateStockData(symbols: string[], client: any): Promise<void> {
  try {
    // Fetch and update stock data
    const stockData: Record<string, any> = {};

    for (const symbol of symbols) {
      const [quote, details, aggs, lastQuote] = await Promise.all([
        client.getQuote(symbol),
        client.getTickerDetails(symbol),
        client.getAggs(symbol),
        client.getLastQuote(symbol),
      ]);

      // Calculate volume analysis
      const volumeAnalysis = {
        averageVolume:
          aggs.results.reduce((sum: number, point: { volume: number }) => sum + point.volume, 0) /
          aggs.results.length,
        currentVolume: lastQuote.lastSize,
        volumeRatio:
          lastQuote.lastSize /
          (aggs.results.reduce((sum: number, point: { volume: number }) => sum + point.volume, 0) /
            aggs.results.length),
      };

      // Calculate short interest analysis
      const shortInterestAnalysis = {
        shortInterest: details.shortInterest,
        shortInterestRatio: details.shortInterestRatio,
        shortInterestPercent: (details.shortInterest / details.sharesOutstanding) * 100,
      };

      stockData[symbol] = {
        symbol,
        quote,
        details,
        volumeAnalysis,
        shortInterestAnalysis,
        lastUpdated: Date.now(),
      };
    }

    // Store updated data
    await cacheManager.set(CACHE_KEYS.STOCK_DATA, stockData, CACHE_TTL.STOCK_DATA);
    await cacheManager.set(CACHE_KEYS.LAST_UPDATE, Date.now());

    // Create backup after successful update
    await createBackup();

    // Cleanup old backups (keep last 5)
    await cleanupOldBackups(5);
  } catch (error) {
    console.error('Failed to update stock data:', error);
    throw new Error('Failed to update stock data');
  }
}

/**
 * Gets the latest stock data, updating if necessary
 */
export async function getLatestStockData(
  symbols: string[],
  client: any,
): Promise<Record<string, StockAnalysis>> {
  if (await shouldUpdateData()) {
    await updateStockData(symbols, client);
  }

  const data = await cacheManager.get<Record<string, StockAnalysis>>(CACHE_KEYS.STOCK_DATA);
  if (!data) {
    throw new Error('No stock data available');
  }

  return data;
}
