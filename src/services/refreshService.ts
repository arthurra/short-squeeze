import { DataCache } from "../lib/utils/dataCache";
import { StockUniverseManager } from "../lib/utils/stockUniverse";
import { StockDataService } from "./stockDataService";

export class RefreshService {
  private static instance: RefreshService;
  private cache: DataCache;
  private stockUniverseManager: StockUniverseManager;
  private stockDataService: StockDataService;
  private refreshInterval: NodeJS.Timeout | null = null;
  private readonly REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.cache = DataCache.getInstance();
    this.stockUniverseManager = StockUniverseManager.getInstance();
    this.stockDataService = new StockDataService();
  }

  static getInstance(): RefreshService {
    if (!RefreshService.instance) {
      RefreshService.instance = new RefreshService();
    }
    return RefreshService.instance;
  }

  async startRefreshCycle(): Promise<void> {
    // Initial refresh
    await this.refreshData();

    // Schedule periodic refresh
    this.refreshInterval = setInterval(
      () => this.refreshData(),
      this.REFRESH_INTERVAL
    );
  }

  stopRefreshCycle(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private async refreshData(): Promise<void> {
    try {
      console.log("Starting daily data refresh...");

      // Get the current stock universe
      const symbols = await this.stockUniverseManager.getInitialStockUniverse();

      // Refresh data for each symbol
      const refreshPromises = symbols.map(async (symbol) => {
        try {
          await this.stockDataService.getStockData(symbol);
          console.log(`Refreshed data for ${symbol}`);
        } catch (error) {
          console.error(`Failed to refresh data for ${symbol}:`, error);
        }
      });

      // Wait for all refreshes to complete
      await Promise.all(refreshPromises);

      // Clear expired cache entries
      this.cache.clearExpired();

      console.log("Daily data refresh completed");
    } catch (error) {
      console.error("Error during data refresh:", error);
      throw error;
    }
  }

  async forceRefresh(): Promise<void> {
    // Clear the cache
    this.cache.clear();

    // Perform a fresh refresh
    await this.refreshData();
  }
}
