import { cacheManager, CACHE_KEYS, CACHE_TTL } from './cache';
import { PriceDataPoint, HistoricalPrices } from '../types/stock';

const RETENTION_DAYS = 30;
const HISTORICAL_DATA_PREFIX = 'historical_data:';

/**
 * Stores historical price data for a stock
 */
export async function storeHistoricalData(symbol: string, data: PriceDataPoint[]): Promise<void> {
  const key = `${HISTORICAL_DATA_PREFIX}${symbol}`;
  const historicalData: HistoricalPrices = {
    symbol,
    timeframe: '1M',
    data: data.slice(-RETENTION_DAYS), // Only keep last 30 days
  };

  await cacheManager.set(key, historicalData, CACHE_TTL.HISTORICAL_DATA);
}

/**
 * Retrieves historical price data for a stock
 */
export async function getHistoricalData(symbol: string): Promise<HistoricalPrices | null> {
  const key = `${HISTORICAL_DATA_PREFIX}${symbol}`;
  return cacheManager.get<HistoricalPrices>(key);
}

/**
 * Cleans up historical data older than retention period
 */
export async function cleanupHistoricalData(): Promise<void> {
  const now = Date.now();
  const retentionCutoff = now - RETENTION_DAYS * 24 * 60 * 60 * 1000;

  // Get all historical data keys
  const keys = await cacheManager.keys(HISTORICAL_DATA_PREFIX);

  // Process each key
  for (const key of keys) {
    const data = await cacheManager.get<HistoricalPrices>(key);
    if (data) {
      // Filter out data points older than retention period
      const filteredData = {
        ...data,
        data: data.data.filter((point) => point.timestamp >= retentionCutoff),
      };

      // Update or delete based on remaining data
      if (filteredData.data.length > 0) {
        await cacheManager.set(key, filteredData, CACHE_TTL.HISTORICAL_DATA);
      } else {
        await cacheManager.delete(key);
      }
    }
  }
}

/**
 * Gets historical data for multiple symbols
 */
export async function getHistoricalDataForSymbols(
  symbols: string[],
): Promise<Record<string, HistoricalPrices>> {
  const results: Record<string, HistoricalPrices> = {};

  await Promise.all(
    symbols.map(async (symbol) => {
      const data = await getHistoricalData(symbol);
      if (data) {
        results[symbol] = data;
      }
    }),
  );

  return results;
}

/**
 * Updates historical data for multiple symbols
 */
export async function updateHistoricalDataForSymbols(
  symbolData: Record<string, PriceDataPoint[]>,
): Promise<void> {
  await Promise.all(
    Object.entries(symbolData).map(([symbol, data]) => storeHistoricalData(symbol, data)),
  );
}
