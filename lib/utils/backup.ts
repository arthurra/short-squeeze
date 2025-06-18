import { kv } from '../kv';
import { cacheManager, CACHE_KEYS } from './cache';
import { HistoricalPrices } from '../types/stock';

// Backup key prefixes
const BACKUP_KEYS = {
  STOCK_DATA: 'backup:stock_data',
  HISTORICAL_DATA: 'backup:historical_data',
  MARKET_DATA: 'backup:market_data',
  LAST_BACKUP: 'backup:last_backup',
} as const;

// Backup metadata interface
interface BackupMetadata {
  timestamp: number;
  version: string;
  dataType: string;
  recordCount: number;
}

/**
 * Creates a backup of the current data
 */
export async function createBackup(): Promise<void> {
  try {
    const timestamp = Date.now();
    const backupVersion = '1.0.0';

    // Backup stock data
    const stockData = await cacheManager.get(CACHE_KEYS.STOCK_DATA);
    if (stockData) {
      const stockBackupKey = `${BACKUP_KEYS.STOCK_DATA}:${timestamp}`;
      await kv.set(stockBackupKey, {
        data: stockData,
        metadata: {
          timestamp,
          version: backupVersion,
          dataType: 'stock_data',
          recordCount: Object.keys(stockData).length,
        },
      });
    }

    // Backup historical data
    const historicalKeys = await kv.keys(`${CACHE_KEYS.HISTORICAL_DATA}:*`);
    const historicalData: Record<string, HistoricalPrices> = {};

    if (Array.isArray(historicalKeys)) {
      for (const key of historicalKeys) {
        const data = await kv.get<HistoricalPrices>(key);
        if (data) {
          const symbol = key.split(':')[1];
          historicalData[symbol] = data;
        }
      }
    }

    if (Object.keys(historicalData).length > 0) {
      const historicalBackupKey = `${BACKUP_KEYS.HISTORICAL_DATA}:${timestamp}`;
      await kv.set(historicalBackupKey, {
        data: historicalData,
        metadata: {
          timestamp,
          version: backupVersion,
          dataType: 'historical_data',
          recordCount: Object.keys(historicalData).length,
        },
      });
    }

    // Update last backup timestamp
    await kv.set(BACKUP_KEYS.LAST_BACKUP, timestamp);
  } catch (error) {
    console.error('Backup creation failed:', error);
    throw new Error('Failed to create backup');
  }
}

/**
 * Restores data from the most recent backup
 */
export async function restoreFromBackup(): Promise<void> {
  try {
    // Get the most recent backup timestamp
    const lastBackup = await kv.get<number>(BACKUP_KEYS.LAST_BACKUP);
    if (!lastBackup) {
      throw new Error('No backup found');
    }

    // Restore stock data
    const stockBackupKey = `${BACKUP_KEYS.STOCK_DATA}:${lastBackup}`;
    const stockBackup = await kv.get<{ data: any; metadata: BackupMetadata }>(stockBackupKey);
    if (stockBackup) {
      await cacheManager.set(CACHE_KEYS.STOCK_DATA, stockBackup.data);
    }

    // Restore historical data
    const historicalBackupKey = `${BACKUP_KEYS.HISTORICAL_DATA}:${lastBackup}`;
    const historicalBackup = await kv.get<{
      data: Record<string, HistoricalPrices>;
      metadata: BackupMetadata;
    }>(historicalBackupKey);

    if (historicalBackup) {
      for (const [symbol, data] of Object.entries(historicalBackup.data)) {
        const key = `${CACHE_KEYS.HISTORICAL_DATA}:${symbol}`;
        await cacheManager.set(key, data);
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'No backup found') {
      throw error;
    }
    console.error('Backup restoration failed:', error);
    throw new Error('Failed to restore from backup');
  }
}

/**
 * Lists all available backups
 */
export async function listBackups(): Promise<
  Array<{ timestamp: number; metadata: BackupMetadata }>
> {
  try {
    const backups: Array<{ timestamp: number; metadata: BackupMetadata }> = [];

    // Get stock data backups
    const stockBackupKeys = await kv.keys(`${BACKUP_KEYS.STOCK_DATA}:*`);
    if (Array.isArray(stockBackupKeys)) {
      for (const key of stockBackupKeys) {
        const backup = await kv.get<{ data: any; metadata: BackupMetadata }>(key);
        if (backup) {
          backups.push({
            timestamp: backup.metadata.timestamp,
            metadata: backup.metadata,
          });
        }
      }
    }

    return backups.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to list backups:', error);
    return [];
  }
}

/**
 * Deletes old backups, keeping only the most recent N backups
 */
export async function cleanupOldBackups(keepCount: number = 5): Promise<void> {
  try {
    const backups = await listBackups();
    if (backups.length <= keepCount) return;

    const backupsToDelete = backups.slice(keepCount);
    for (const backup of backupsToDelete) {
      const stockBackupKey = `${BACKUP_KEYS.STOCK_DATA}:${backup.timestamp}`;
      const historicalBackupKey = `${BACKUP_KEYS.HISTORICAL_DATA}:${backup.timestamp}`;

      await Promise.all([kv.del(stockBackupKey), kv.del(historicalBackupKey)]);
    }
  } catch (error) {
    console.error('Failed to cleanup old backups:', error);
    throw new Error('Failed to cleanup old backups');
  }
}
