import { StockData } from "../types/stock";

interface SplitInfo {
  hasReverseSplit: boolean;
  splitRatio?: number;
  splitDate?: Date;
}

/**
 * Detects reverse splits in stock data by analyzing price history
 * A reverse split is typically indicated by a sudden price increase
 * followed by a corresponding volume decrease
 */
export class SplitDetection {
  private static readonly PRICE_JUMP_THRESHOLD = 2.5; // Minimum price increase to consider as potential split
  private static readonly VOLUME_DROP_THRESHOLD = 0.5; // Minimum volume decrease to consider as potential split
  private static readonly LOOKBACK_DAYS = 30; // Number of days to look back for split detection

  /**
   * Analyzes stock data to detect potential reverse splits
   * @param stockData The stock data to analyze
   * @returns SplitInfo object containing split detection results
   */
  public static detectReverseSplit(stockData: StockData): SplitInfo {
    if (!stockData.historicalData || stockData.historicalData.length < 2) {
      return { hasReverseSplit: false };
    }

    // Sort historical data by date in ascending order
    const sortedData = [...stockData.historicalData].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    // Look for significant price jumps
    for (let i = 1; i < sortedData.length; i++) {
      const current = sortedData[i];
      const previous = sortedData[i - 1];

      // Calculate price and volume changes
      const priceChange = current.close / previous.close;
      const volumeChange = current.volume / previous.volume;

      // Check if the changes match reverse split patterns
      if (
        priceChange >= this.PRICE_JUMP_THRESHOLD &&
        volumeChange <= this.VOLUME_DROP_THRESHOLD
      ) {
        // Calculate approximate split ratio
        const splitRatio = Math.round(priceChange);

        return {
          hasReverseSplit: true,
          splitRatio,
          splitDate: current.date,
        };
      }
    }

    return { hasReverseSplit: false };
  }

  /**
   * Adjusts historical prices for reverse splits
   * @param stockData The stock data to adjust
   * @param splitInfo Information about the reverse split
   * @returns Adjusted stock data
   */
  public static adjustForReverseSplit(
    stockData: StockData,
    splitInfo: SplitInfo
  ): StockData {
    if (
      !splitInfo.hasReverseSplit ||
      !splitInfo.splitDate ||
      !splitInfo.splitRatio
    ) {
      return stockData;
    }

    const adjustedData = { ...stockData };

    // Adjust historical prices before the split
    if (adjustedData.historicalData) {
      adjustedData.historicalData = adjustedData.historicalData.map((data) => {
        if (data.date < splitInfo.splitDate!) {
          return {
            ...data,
            open: data.open / splitInfo.splitRatio!,
            high: data.high / splitInfo.splitRatio!,
            low: data.low / splitInfo.splitRatio!,
            close: data.close / splitInfo.splitRatio!,
            volume: data.volume * splitInfo.splitRatio!,
          };
        }
        return data;
      });
    }

    return adjustedData;
  }
}
