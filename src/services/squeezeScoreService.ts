import { StockData } from "../lib/types/stock";

export class SqueezeScoreService {
  private static instance: SqueezeScoreService;

  private constructor() {}

  static getInstance(): SqueezeScoreService {
    if (!SqueezeScoreService.instance) {
      SqueezeScoreService.instance = new SqueezeScoreService();
    }
    return SqueezeScoreService.instance;
  }

  /**
   * Calculates a basic squeeze signal score (0-100) for a stock
   * @param stock The stock data to analyze
   * @returns A score between 0 and 100
   */
  calculateBasicScore(stock: StockData): number {
    let score = 0;

    // Price change component (0-15 points)
    if (stock.changePercent) {
      const priceChangeScore = Math.min(Math.abs(stock.changePercent) * 2, 15);
      score += priceChangeScore;
    }

    // Volume component (0-15 points)
    if (stock.volume && stock.historicalData) {
      const volumeScore = this.calculateVolumeScore(stock);
      score += volumeScore;
    }

    // Short interest component (0-15 points)
    if (stock.shortInterest) {
      const shortInterestScore = this.calculateShortInterestScore(stock);
      score += shortInterestScore;
    }

    // Trading flow component (0-15 points)
    if (stock.tradingFlow) {
      const tradingFlowScore = this.calculateTradingFlowScore(stock);
      score += tradingFlowScore;
    }

    // SEC filing component (0-15 points)
    if (stock.secFilings) {
      const secFilingScore = this.calculateSECFilingScore(stock);
      score += secFilingScore;
    }

    // Market cap component (0-10 points)
    if (stock.marketCap) {
      // Lower market cap gets higher score (inverse relationship)
      const marketCapScore = Math.max(
        0,
        10 - (Math.log10(stock.marketCap) - 7) * 2
      );
      score += marketCapScore;
    }

    // Price range component (0-10 points)
    if (stock.price) {
      // Stocks between $1-$5 get higher scores
      if (stock.price >= 1 && stock.price <= 5) {
        score += 10;
      } else if (stock.price > 5 && stock.price <= 10) {
        score += 5;
      } else if (stock.price > 10 && stock.price <= 20) {
        score += 2;
      }
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculates a volume score based on multiple volume metrics
   * @param stock The stock data to analyze
   * @returns A score between 0 and 20
   */
  private calculateVolumeScore(stock: StockData): number {
    if (!stock.historicalData || stock.historicalData.length < 2) {
      return 0;
    }

    let volumeScore = 0;

    // Calculate various volume metrics
    const avgVolume = this.calculateAverageVolume(stock.historicalData);
    const volumeRatio = stock.volume / avgVolume;
    const volumeTrend = this.calculateVolumeTrend(stock.historicalData);
    const volumeSpike = this.detectVolumeSpike(stock.historicalData);

    // Volume ratio component (0-10 points)
    volumeScore += Math.min(volumeRatio * 5, 10);

    // Volume trend component (0-5 points)
    if (volumeTrend > 0) {
      volumeScore += Math.min(volumeTrend * 2.5, 5);
    }

    // Volume spike component (0-5 points)
    if (volumeSpike) {
      volumeScore += 5;
    }

    return Math.min(volumeScore, 20);
  }

  /**
   * Calculates a score based on short interest metrics
   * @param stock The stock data to analyze
   * @returns A score between 0 and 20
   */
  private calculateShortInterestScore(stock: StockData): number {
    if (!stock.shortInterest) return 0;

    let score = 0;

    // Short interest percentage component (0-12 points)
    const shortPercent = stock.shortInterest.shortInterestPercent;
    if (shortPercent >= 30) {
      score += 12;
    } else if (shortPercent >= 20) {
      score += 10;
    } else if (shortPercent >= 15) {
      score += 8;
    } else if (shortPercent >= 10) {
      score += 6;
    } else if (shortPercent >= 5) {
      score += 4;
    }

    // Days to cover component (0-8 points)
    const daysToCover = stock.shortInterest.shortInterestRatio;
    if (daysToCover >= 10) {
      score += 8;
    } else if (daysToCover >= 7) {
      score += 6;
    } else if (daysToCover >= 5) {
      score += 4;
    } else if (daysToCover >= 3) {
      score += 2;
    }

    return Math.min(score, 20);
  }

  /**
   * Calculates a score based on trading flow metrics
   * @param stock The stock data to analyze
   * @returns A score between 0 and 20
   */
  private calculateTradingFlowScore(stock: StockData): number {
    if (!stock.tradingFlow) return 0;

    let score = 0;

    // Net flow component (0-8 points)
    const netFlow = stock.tradingFlow.netFlow;
    const totalVolume =
      stock.tradingFlow.buyVolume + stock.tradingFlow.sellVolume;
    const netFlowRatio = totalVolume > 0 ? netFlow / totalVolume : 0;

    if (netFlowRatio >= 0.5) {
      score += 8;
    } else if (netFlowRatio >= 0.3) {
      score += 6;
    } else if (netFlowRatio >= 0.2) {
      score += 4;
    } else if (netFlowRatio >= 0.1) {
      score += 2;
    }

    // Large transactions component (0-6 points)
    const largeTransactionRatio =
      stock.tradingFlow.largeTransactions / totalVolume;
    if (largeTransactionRatio >= 0.1) {
      score += 6;
    } else if (largeTransactionRatio >= 0.05) {
      score += 4;
    } else if (largeTransactionRatio >= 0.02) {
      score += 2;
    }

    // Block transactions component (0-6 points)
    const blockTransactionRatio =
      stock.tradingFlow.blockTransactions / totalVolume;
    if (blockTransactionRatio >= 0.05) {
      score += 6;
    } else if (blockTransactionRatio >= 0.02) {
      score += 4;
    } else if (blockTransactionRatio >= 0.01) {
      score += 2;
    }

    return Math.min(score, 20);
  }

  /**
   * Calculates the average volume from historical data
   * @param historicalData Array of historical price/volume data
   * @returns Average volume
   */
  private calculateAverageVolume(
    historicalData: Array<{ volume: number }>
  ): number {
    if (!historicalData.length) return 0;
    const sum = historicalData.reduce((acc, data) => acc + data.volume, 0);
    return sum / historicalData.length;
  }

  /**
   * Calculates the volume trend over the last 5 days
   * @param historicalData Array of historical price/volume data
   * @returns Volume trend ratio (1.0 means no change, >1.0 means increasing)
   */
  private calculateVolumeTrend(
    historicalData: Array<{ volume: number; date: Date }>
  ): number {
    if (historicalData.length < 5) return 0;

    // Sort by date in descending order
    const sortedData = [...historicalData].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // Get last 5 days of volume data
    const recentVolumes = sortedData.slice(0, 5).map((data) => data.volume);
    const olderVolumes = sortedData.slice(5, 10).map((data) => data.volume);

    if (olderVolumes.length === 0) return 0;

    const recentAvg =
      recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    const olderAvg =
      olderVolumes.reduce((a, b) => a + b, 0) / olderVolumes.length;

    return olderAvg === 0 ? 0 : recentAvg / olderAvg;
  }

  /**
   * Detects if there's a significant volume spike in recent data
   * @param historicalData Array of historical price/volume data
   * @returns True if a volume spike is detected
   */
  private detectVolumeSpike(
    historicalData: Array<{ volume: number; date: Date }>
  ): boolean {
    if (historicalData.length < 2) return false;

    // Sort by date in descending order
    const sortedData = [...historicalData].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // Get the most recent volume and the average of the previous 5 days
    const latestVolume = sortedData[0].volume;
    const previousVolumes = sortedData.slice(1, 6).map((data) => data.volume);
    const avgPreviousVolume =
      previousVolumes.reduce((a, b) => a + b, 0) / previousVolumes.length;

    // Consider it a spike if volume is more than 3x the average
    return latestVolume > avgPreviousVolume * 3;
  }

  /**
   * Calculates a score based on SEC filing analysis
   * @param stock The stock data to analyze
   * @returns A score between 0 and 15
   */
  private calculateSECFilingScore(stock: StockData): number {
    if (!stock.secFilings || stock.secFilings.length === 0) return 0;

    let score = 0;
    const recentFilings = stock.secFilings.filter((filing) => filing.isRecent);
    const filingTypes = new Set(recentFilings.map((filing) => filing.type));

    // Recent filing presence (0-5 points)
    if (recentFilings.length > 0) {
      score += Math.min(recentFilings.length, 5);
    }

    // Important filing types (0-5 points)
    const importantTypes = ["8-K", "10-K", "10-Q", "S-1", "S-3", "424B3"];
    const importantFilingCount = Array.from(filingTypes).filter((type) =>
      importantTypes.includes(type)
    ).length;
    score += Math.min(importantFilingCount, 5);

    // Filing frequency (0-5 points)
    const filingFrequency = recentFilings.length / 30; // filings per month
    if (filingFrequency >= 2) {
      score += 5;
    } else if (filingFrequency >= 1) {
      score += 3;
    } else if (filingFrequency >= 0.5) {
      score += 1;
    }

    return Math.min(score, 15);
  }
}
