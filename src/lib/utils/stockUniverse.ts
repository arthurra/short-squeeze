import { StockDataService } from "../../services/stockDataService";

export class StockUniverseManager {
  private stockDataService: StockDataService;
  private static instance: StockUniverseManager;

  private constructor() {
    this.stockDataService = new StockDataService();
  }

  static getInstance(): StockUniverseManager {
    if (!StockUniverseManager.instance) {
      StockUniverseManager.instance = new StockUniverseManager();
    }
    return StockUniverseManager.instance;
  }

  async getInitialStockUniverse(): Promise<string[]> {
    // For now, return a hardcoded list of penny stocks
    // In a production environment, this would fetch from a database or API
    return [
      "SNDL",
      "NAKD",
      "CIDM",
      "ZOM",
      "CTRM",
      "IDEX",
      "CIDM",
      "ONTX",
      "SHIP",
      "MARK",
      "ATOS",
      "CIDM",
      "ZOM",
      "CTRM",
      "IDEX",
      "CIDM",
      "ONTX",
      "SHIP",
      "MARK",
      "ATOS",
    ];
  }

  async getFilteredStockUniverse(filters: {
    minPrice?: number;
    maxPrice?: number;
    minMarketCap?: number;
    maxMarketCap?: number;
    minVolume?: number;
  }): Promise<string[]> {
    const initialUniverse = await this.getInitialStockUniverse();
    const filteredData = await this.stockDataService.filterStockUniverse(
      initialUniverse,
      filters
    );
    return filteredData.map((stock) => stock.symbol);
  }
}
