import { expect, jest, describe, it, beforeEach } from '@jest/globals';
import { kv as realKv } from '../../../lib/kv';
import { mockPolygonClient as realMockPolygonClient } from '../mocks/polygonClient';

// Define the interface for the mock client expected by updateStockData
interface MockClient {
  getQuote: (symbol: string) => Promise<any>;
  getTickerDetails: (symbol: string) => Promise<any>;
  getAggs: (symbol: string) => Promise<any>;
  getLastQuote: (symbol: string) => Promise<any>;
}

// Define mockPolygonClient at the top level
const mockPolygonClient = {
  getQuote: jest.fn(),
  dailyOpenClose: jest.fn(),
  previousClose: jest.fn(),
  aggregates: jest.fn(),
  lastQuote: jest.fn(),
  getTickerDetails: jest.fn(),
  getAggs: jest.fn(),
  getLastQuote: jest.fn(),
};

// Mock the Polygon.io client before any imports that use it
jest.mock('@polygon.io/client-js', () => ({
  __esModule: true,
  default: () => mockPolygonClient,
}));

// Mock the cache manager
jest.mock('./cache', () => ({
  __esModule: true,
  cacheManager: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
  CACHE_KEYS: {
    LAST_UPDATE: 'last_update',
    STOCK_DATA: 'stock_data',
  },
  CACHE_TTL: {
    STOCK_DATA: 86400,
  },
}));

// Mock the backup utilities
jest.mock('./backup', () => ({
  __esModule: true,
  createBackup: jest.fn().mockResolvedValue(undefined),
  cleanupOldBackups: jest.fn().mockResolvedValue(undefined),
}));

// All imports must come after the mocks
import {
  shouldUpdateData,
  updateStockData,
  getLatestStockData,
} from '../../../lib/utils/dailyUpdate';
import { cacheManager, CACHE_KEYS } from './cache';

describe('Daily Update Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (cacheManager.get as jest.Mock).mockReset();
    (cacheManager.set as jest.Mock).mockReset();

    // Mock Polygon client responses with proper data structures
    mockPolygonClient.getQuote.mockReset().mockResolvedValue({
      price: 100,
      volume: 1000000,
      timestamp: Date.now(),
    });

    mockPolygonClient.getTickerDetails.mockReset().mockResolvedValue({
      name: 'Apple Inc.',
      marketCap: 2000000000,
      sector: 'Technology',
      industry: 'Consumer Electronics',
      shortInterest: 1000000,
      shortInterestRatio: 0.1,
      sharesOutstanding: 10000000,
    });

    mockPolygonClient.getAggs.mockReset().mockResolvedValue({
      results: [
        { v: 1000000, t: Date.now(), o: 95, h: 105, l: 90, c: 100 },
        { v: 1200000, t: Date.now() - 86400000, o: 90, h: 100, l: 85, c: 95 },
      ],
    });

    mockPolygonClient.getLastQuote.mockReset().mockResolvedValue({
      lastPrice: 100,
      lastSize: 1000,
      timestamp: Date.now(),
      change: 5,
      changePercent: 5,
    });
  });

  describe('shouldUpdateData', () => {
    it('should return true if no last update exists', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);
      expect(await shouldUpdateData()).toBe(true);
    });

    it('should return true if last update was more than 24 hours ago', async () => {
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      (cacheManager.get as jest.Mock).mockResolvedValue(twoDaysAgo);
      expect(await shouldUpdateData()).toBe(true);
    });

    it('should return false if last update was less than 24 hours ago', async () => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      (cacheManager.get as jest.Mock).mockResolvedValue(oneHourAgo);
      expect(await shouldUpdateData()).toBe(false);
    });
  });

  describe('updateStockData', () => {
    const mockSymbols = ['AAPL', 'MSFT'];

    it('should update stock data for all symbols', async () => {
      (cacheManager.set as jest.Mock).mockResolvedValue(undefined);
      await expect(updateStockData(mockSymbols, mockPolygonClient)).resolves.not.toThrow();
      expect(cacheManager.set).toHaveBeenCalledWith(
        CACHE_KEYS.STOCK_DATA,
        expect.objectContaining({ AAPL: expect.any(Object) }),
        expect.any(Number),
      );
      expect(cacheManager.set).toHaveBeenCalledWith(CACHE_KEYS.LAST_UPDATE, expect.any(Number));
    });

    it('should handle API errors gracefully', async () => {
      mockPolygonClient.getQuote.mockRejectedValueOnce(new Error('API Error'));
      await expect(updateStockData(mockSymbols, mockPolygonClient)).rejects.toThrow(
        'Failed to update stock data',
      );
    });
  });

  describe('getLatestStockData', () => {
    const mockSymbols = ['AAPL', 'MSFT'];
    const mockStockData = {
      AAPL: {
        symbol: 'AAPL',
        quote: { price: 150, volume: 1000000 },
        details: { name: 'Apple Inc.', marketCap: 2000000000 },
        volumeAnalysis: { averageVolume: 1000000, currentVolume: 1500000 },
        shortInterestAnalysis: { shortInterest: 1000000, shortInterestRatio: 0.1 },
        lastUpdated: Date.now(),
      },
    };

    it('should return cached data if it exists and is recent', async () => {
      const now = Date.now();
      (cacheManager.get as jest.Mock).mockImplementation((key) => {
        if (key === CACHE_KEYS.LAST_UPDATE) return now;
        if (key === CACHE_KEYS.STOCK_DATA) return mockStockData;
        return undefined;
      });

      const data = await getLatestStockData(['AAPL'], mockPolygonClient);
      expect(data).toEqual(mockStockData);
    });

    it('should update data if cache is stale', async () => {
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      (cacheManager.get as jest.Mock).mockImplementation((key) => {
        if (key === CACHE_KEYS.LAST_UPDATE) return twoDaysAgo;
        if (key === CACHE_KEYS.STOCK_DATA) return mockStockData;
        return undefined;
      });

      (cacheManager.set as jest.Mock).mockResolvedValue(undefined);
      const data = await getLatestStockData(['AAPL'], mockPolygonClient);
      expect(data).toHaveProperty('AAPL');
    });

    it('should throw error if no data is available', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);
      await expect(getLatestStockData(mockSymbols, mockPolygonClient)).rejects.toThrow(
        'No stock data available',
      );
    });
  });
});
