import { StockData } from "../types/stock";
import { USExchange } from "./exchangeUtils";

export interface FilterCriteria {
  priceRange?: {
    min: number;
    max: number;
  };
  marketCapRange?: {
    min: number;
    max: number;
  };
  volumeRange?: {
    min: number;
    max: number;
  };
  exchanges?: USExchange[];
  excludeReverseSplits?: boolean;
  minDaysSinceSplit?: number;
}

export class FilterUtils {
  /**
   * Combines multiple filter criteria and applies them to stock data
   * @param stocks Array of stock data to filter
   * @param criteria Filter criteria to apply
   * @returns Filtered array of stocks
   */
  public static applyFilters(
    stocks: StockData[],
    criteria: FilterCriteria
  ): StockData[] {
    return stocks.filter((stock) => {
      // Price range filter
      if (criteria.priceRange) {
        if (
          stock.price < criteria.priceRange.min ||
          stock.price > criteria.priceRange.max
        ) {
          return false;
        }
      }

      // Market cap range filter
      if (criteria.marketCapRange) {
        if (
          stock.marketCap < criteria.marketCapRange.min ||
          stock.marketCap > criteria.marketCapRange.max
        ) {
          return false;
        }
      }

      // Volume range filter
      if (criteria.volumeRange) {
        if (
          stock.volume < criteria.volumeRange.min ||
          stock.volume > criteria.volumeRange.max
        ) {
          return false;
        }
      }

      // Exchange filter
      if (criteria.exchanges && criteria.exchanges.length > 0) {
        if (!criteria.exchanges.includes(stock.exchange as USExchange)) {
          return false;
        }
      }

      // Reverse split filter
      if (criteria.excludeReverseSplits && stock.historicalData) {
        const hasRecentSplit = this.detectRecentReverseSplit(
          stock,
          criteria.minDaysSinceSplit || 30
        );
        if (hasRecentSplit) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Detects if a stock has had a reverse split within the specified number of days
   * @param stock Stock data to check
   * @param days Number of days to look back
   * @returns True if a reverse split was detected within the specified period
   */
  private static detectRecentReverseSplit(
    stock: StockData,
    days: number
  ): boolean {
    if (!stock.historicalData || stock.historicalData.length < 2) {
      return false;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Sort historical data by date in descending order
    const sortedData = [...stock.historicalData].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // Look for significant price jumps within the specified period
    for (let i = 1; i < sortedData.length; i++) {
      const current = sortedData[i - 1];
      const previous = sortedData[i];

      // Skip if the data point is too old
      if (current.date < cutoffDate) {
        break;
      }

      // Calculate price and volume changes
      const priceChange = current.close / previous.close;
      const volumeChange = current.volume / previous.volume;

      // Check if the changes match reverse split patterns
      if (priceChange >= 2.5 && volumeChange <= 0.5) {
        return true;
      }
    }

    return false;
  }

  /**
   * Combines multiple filter criteria into a single criteria object
   * @param criteria Array of filter criteria to combine
   * @returns Combined filter criteria
   */
  public static combineFilterCriteria(
    criteria: FilterCriteria[]
  ): FilterCriteria {
    return criteria.reduce((combined, current) => {
      // Combine price ranges
      if (current.priceRange) {
        combined.priceRange = {
          min: Math.max(combined.priceRange?.min || 0, current.priceRange.min),
          max: Math.min(
            combined.priceRange?.max || Infinity,
            current.priceRange.max
          ),
        };
      }

      // Combine market cap ranges
      if (current.marketCapRange) {
        combined.marketCapRange = {
          min: Math.max(
            combined.marketCapRange?.min || 0,
            current.marketCapRange.min
          ),
          max: Math.min(
            combined.marketCapRange?.max || Infinity,
            current.marketCapRange.max
          ),
        };
      }

      // Combine volume ranges
      if (current.volumeRange) {
        combined.volumeRange = {
          min: Math.max(
            combined.volumeRange?.min || 0,
            current.volumeRange.min
          ),
          max: Math.min(
            combined.volumeRange?.max || Infinity,
            current.volumeRange.max
          ),
        };
      }

      // Combine exchange filters
      if (current.exchanges) {
        combined.exchanges = combined.exchanges
          ? combined.exchanges.filter((exchange) =>
              current.exchanges!.includes(exchange)
            )
          : current.exchanges;
      }

      // Combine reverse split filters
      if (current.excludeReverseSplits) {
        combined.excludeReverseSplits = true;
        combined.minDaysSinceSplit = Math.max(
          combined.minDaysSinceSplit || 0,
          current.minDaysSinceSplit || 0
        );
      }

      return combined;
    }, {} as FilterCriteria);
  }
}
