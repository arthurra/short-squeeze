import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { kv } from '../../../lib/kv';
import { cacheManager } from './cache';
import { createBackup, restoreFromBackup, listBackups, cleanupOldBackups } from './backup';

// Mock the KV store and cache manager
jest.mock('../kv', () => ({
  kv: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  },
}));

jest.mock('./cache', () => ({
  cacheManager: {
    get: jest.fn(),
    set: jest.fn(),
  },
  CACHE_KEYS: {
    STOCK_DATA: 'stock_data',
    HISTORICAL_DATA: 'historical_data',
  },
}));

describe('Backup Utilities', () => {
  const mockTimestamp = 1234567890;
  const mockStockData = {
    AAPL: { symbol: 'AAPL', price: 150 },
    MSFT: { symbol: 'MSFT', price: 200 },
  };

  const mockHistoricalData = {
    AAPL: {
      symbol: 'AAPL',
      timeframe: '1M',
      data: [{ timestamp: 1234567890, price: 150 }],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
  });

  describe('createBackup', () => {
    it('should create a backup of stock data', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(mockStockData);
      (kv.keys as jest.Mock).mockResolvedValue([]);

      await createBackup();

      expect(kv.set).toHaveBeenCalledWith('backup:stock_data:1234567890', {
        data: mockStockData,
        metadata: {
          timestamp: mockTimestamp,
          version: '1.0.0',
          dataType: 'stock_data',
          recordCount: 2,
        },
      });
    });

    it('should create a backup of historical data', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (kv.keys as jest.Mock).mockResolvedValue(['historical_data:AAPL']);
      (kv.get as jest.Mock).mockResolvedValue(mockHistoricalData.AAPL);

      await createBackup();

      expect(kv.set).toHaveBeenCalledWith('backup:historical_data:1234567890', {
        data: mockHistoricalData,
        metadata: {
          timestamp: mockTimestamp,
          version: '1.0.0',
          dataType: 'historical_data',
          recordCount: 1,
        },
      });
    });

    it('should handle errors gracefully', async () => {
      (cacheManager.get as jest.Mock).mockRejectedValue(new Error('Cache error'));

      await expect(createBackup()).rejects.toThrow('Failed to create backup');
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore data from the most recent backup', async () => {
      (kv.get as jest.Mock)
        .mockResolvedValueOnce(mockTimestamp) // Last backup timestamp
        .mockResolvedValueOnce({ data: mockStockData, metadata: {} }) // Stock backup
        .mockResolvedValueOnce({ data: mockHistoricalData, metadata: {} }); // Historical backup

      await restoreFromBackup();

      expect(cacheManager.set).toHaveBeenCalledWith('stock_data', mockStockData);
      expect(cacheManager.set).toHaveBeenCalledWith(
        'historical_data:AAPL',
        mockHistoricalData.AAPL,
      );
    });

    it('should throw error if no backup exists', async () => {
      (kv.get as jest.Mock).mockResolvedValue(null);

      await expect(restoreFromBackup()).rejects.toThrow('No backup found');
    });
  });

  describe('listBackups', () => {
    it('should list all available backups', async () => {
      const mockBackup = {
        data: mockStockData,
        metadata: {
          timestamp: mockTimestamp,
          version: '1.0.0',
          dataType: 'stock_data',
          recordCount: 2,
        },
      };

      (kv.keys as jest.Mock).mockResolvedValue(['backup:stock_data:1234567890']);
      (kv.get as jest.Mock).mockResolvedValue(mockBackup);

      const backups = await listBackups();

      expect(backups).toHaveLength(1);
      expect(backups[0]).toEqual({
        timestamp: mockTimestamp,
        metadata: {
          timestamp: mockTimestamp,
          version: '1.0.0',
          dataType: 'stock_data',
          recordCount: 2,
        },
      });
    });

    it('should return empty array if no backups exist', async () => {
      (kv.keys as jest.Mock).mockResolvedValue([]);

      const backups = await listBackups();

      expect(backups).toHaveLength(0);
    });
  });

  describe('cleanupOldBackups', () => {
    it('should delete old backups keeping only the most recent ones', async () => {
      const mockBackups = [
        {
          timestamp: 1234567890,
          metadata: {
            timestamp: 1234567890,
            version: '1.0.0',
            dataType: 'stock_data',
            recordCount: 2,
          },
        },
        {
          timestamp: 1234567880,
          metadata: {
            timestamp: 1234567880,
            version: '1.0.0',
            dataType: 'stock_data',
            recordCount: 2,
          },
        },
        {
          timestamp: 1234567870,
          metadata: {
            timestamp: 1234567870,
            version: '1.0.0',
            dataType: 'stock_data',
            recordCount: 2,
          },
        },
        {
          timestamp: 1234567860,
          metadata: {
            timestamp: 1234567860,
            version: '1.0.0',
            dataType: 'stock_data',
            recordCount: 2,
          },
        },
        {
          timestamp: 1234567850,
          metadata: {
            timestamp: 1234567850,
            version: '1.0.0',
            dataType: 'stock_data',
            recordCount: 2,
          },
        },
        {
          timestamp: 1234567840,
          metadata: {
            timestamp: 1234567840,
            version: '1.0.0',
            dataType: 'stock_data',
            recordCount: 2,
          },
        },
      ];

      jest.spyOn(require('./backup'), 'listBackups').mockResolvedValue(mockBackups);
      (kv.del as jest.Mock).mockResolvedValue(undefined);

      await cleanupOldBackups(3);

      // Should delete 3 backups (keeping 3 most recent)
      expect(kv.del).toHaveBeenCalledTimes(6); // 3 backups * 2 types (stock and historical)
    });

    it('should not delete backups if count is within limit', async () => {
      const mockBackups = [
        {
          timestamp: 1234567890,
          metadata: {
            timestamp: 1234567890,
            version: '1.0.0',
            dataType: 'stock_data',
            recordCount: 2,
          },
        },
        {
          timestamp: 1234567880,
          metadata: {
            timestamp: 1234567880,
            version: '1.0.0',
            dataType: 'stock_data',
            recordCount: 2,
          },
        },
      ];

      jest.spyOn(require('./backup'), 'listBackups').mockResolvedValue(mockBackups);
      (kv.del as jest.Mock).mockResolvedValue(undefined);

      await cleanupOldBackups(3);

      expect(kv.del).not.toHaveBeenCalled();
    });
  });
});
