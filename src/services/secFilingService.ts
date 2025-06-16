import { SECFiling } from "../lib/types/stock";

export class SECFilingService {
  private static instance: SECFilingService;
  private readonly RECENT_FILING_DAYS = 30;
  private readonly IMPORTANT_FILING_TYPES = [
    "8-K", // Material events
    "10-K", // Annual report
    "10-Q", // Quarterly report
    "S-1", // Initial registration
    "S-3", // Shelf registration
    "424B3", // Prospectus
    "4", // Insider transactions
    "13D", // Beneficial ownership
    "13G", // Beneficial ownership (passive)
    "SC 13G", // Schedule 13G
    "SC 13D", // Schedule 13D
  ];

  private constructor() {}

  static getInstance(): SECFilingService {
    if (!SECFilingService.instance) {
      SECFilingService.instance = new SECFilingService();
    }
    return SECFilingService.instance;
  }

  /**
   * Checks if a stock has recent SEC filings
   * @param filings Array of SEC filings to check
   * @returns Object containing presence check results
   */
  checkFilingPresence(filings: SECFiling[]): {
    hasRecentFilings: boolean;
    recentFilingCount: number;
    hasImportantFilings: boolean;
    importantFilingTypes: string[];
    filingFrequency: number;
  } {
    if (!filings || filings.length === 0) {
      return {
        hasRecentFilings: false,
        recentFilingCount: 0,
        hasImportantFilings: false,
        importantFilingTypes: [],
        filingFrequency: 0,
      };
    }

    const recentFilings = this.getRecentFilings(filings);
    const importantFilingTypes = this.getImportantFilingTypes(recentFilings);
    const filingFrequency = this.calculateFilingFrequency(recentFilings);

    return {
      hasRecentFilings: recentFilings.length > 0,
      recentFilingCount: recentFilings.length,
      hasImportantFilings: importantFilingTypes.length > 0,
      importantFilingTypes,
      filingFrequency,
    };
  }

  /**
   * Gets filings from the last 30 days
   * @param filings Array of all SEC filings
   * @returns Array of recent filings
   */
  private getRecentFilings(filings: SECFiling[]): SECFiling[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.RECENT_FILING_DAYS);

    return filings.filter(
      (filing) => filing.date >= cutoffDate && filing.isRecent
    );
  }

  /**
   * Gets important filing types from recent filings
   * @param recentFilings Array of recent SEC filings
   * @returns Array of important filing types
   */
  private getImportantFilingTypes(recentFilings: SECFiling[]): string[] {
    const filingTypes = new Set(
      recentFilings
        .map((filing) => filing.type)
        .filter((type) => this.IMPORTANT_FILING_TYPES.includes(type))
    );
    return Array.from(filingTypes);
  }

  /**
   * Calculates filing frequency (filings per month)
   * @param recentFilings Array of recent SEC filings
   * @returns Filing frequency
   */
  private calculateFilingFrequency(recentFilings: SECFiling[]): number {
    return recentFilings.length / (this.RECENT_FILING_DAYS / 30);
  }

  /**
   * Checks if a filing type is important
   * @param filingType The filing type to check
   * @returns True if the filing type is important
   */
  isImportantFilingType(filingType: string): boolean {
    return this.IMPORTANT_FILING_TYPES.includes(filingType);
  }

  /**
   * Gets the description for a filing type
   * @param filingType The filing type
   * @returns Description of the filing type
   */
  getFilingTypeDescription(filingType: string): string {
    const descriptions: Record<string, string> = {
      "8-K": "Material events or corporate changes",
      "10-K": "Annual report",
      "10-Q": "Quarterly report",
      "S-1": "Initial registration statement",
      "S-3": "Shelf registration statement",
      "424B3": "Prospectus",
      "4": "Insider transaction report",
      "13D": "Beneficial ownership report (active)",
      "13G": "Beneficial ownership report (passive)",
      "SC 13G": "Schedule 13G filing",
      "SC 13D": "Schedule 13D filing",
    };

    return descriptions[filingType] || "Unknown filing type";
  }
}
