import { shouldUpdateData, updateStockData, getLatestStockData } from './dailyUpdate';
import { kv } from '../kv';
import { mockPolygonClient } from '../mocks/polygonClient';

// Mock the KV store
jest.mock('../kv', () => ({
  kv: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

// Mock the Polygon.io client
jest.mock('@polygon.io/client-js', () => ({
  restClient: () => mockPolygonClient,
}));

describe('Daily Update Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shouldUpdateData', () => {
    it('should return true if no last update exists', async () => {
      (kv.get as jest.Mock).mockResolvedValue(null);
      expect(await shouldUpdateData()).toBe(true);
    });

    it('should return true if last update was more than 24 hours ago', async () => {
      const oneDayAgo = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      (kv.get as jest.Mock).mockResolvedValue(oneDayAgo);
      expect(await shouldUpdateData()).toBe(true);
    });

    it('should return false if last update was less than 24 hours ago', async () => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 hour ago
      (kv.get as jest.Mock).mockResolvedValue(oneHourAgo);
      expect(await shouldUpdateData()).toBe(false);
    });
  });

  describe('updateStockData', () => {
    const mockSymbols = ['AAPL', 'MSFT'];

    it('should update stock data for all symbols', async () => {
      await updateStockData(mockSymbols);

      // Verify KV store was updated
      expect(kv.set).toHaveBeenCalledTimes(2);
      expect(kv.set).toHaveBeenCalledWith('stock_data', expect.any(Object));
      expect(kv.set).toHaveBeenCalledWith('last_update', expect.any(Number));
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      mockPolygonClient.stocks.lastQuote.mockRejectedValueOnce(new Error('API Error'));

      await expect(updateStockData(mockSymbols)).rejects.toThrow('Failed to update stock data');
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
        recentNews: [],
        recentFilings: [],
        squeezeScore: 50,
        lastUpdated: Date.now(),
      },
    };

    it('should return cached data if it exists and is recent', async () => {
      (kv.get as jest.Mock)
        .mockResolvedValueOnce(Date.now() - 60 * 60 * 1000) // Last update 1 hour ago
        .mockResolvedValueOnce(mockStockData);

      const result = await getLatestStockData(mockSymbols);
      expect(result).toEqual(mockStockData);
      expect(kv.set).not.toHaveBeenCalled(); // Should not update data
    });

    it('should update data if cache is stale', async () => {
      (kv.get as jest.Mock)
        .mockResolvedValueOnce(Date.now() - 25 * 60 * 60 * 1000) // Last update 25 hours ago
        .mockResolvedValueOnce(mockStockData);

      await getLatestStockData(mockSymbols);
      expect(kv.set).toHaveBeenCalled(); // Should update data
    });

    it('should throw error if no data is available', async () => {
      (kv.get as jest.Mock)
        .mockResolvedValueOnce(Date.now() - 25 * 60 * 60 * 1000) // Last update 25 hours ago
        .mockResolvedValueOnce(null);

      await expect(getLatestStockData(mockSymbols)).rejects.toThrow('No stock data available');
    });
  });
});
