import { NewsReport } from "../lib/types/stock";

export class NewsReportService {
  private static instance: NewsReportService;
  private readonly RECENT_NEWS_DAYS = 7;
  private readonly RELEVANT_SOURCES = [
    "Seeking Alpha",
    "Bloomberg",
    "Reuters",
    "MarketWatch",
    "CNBC",
    "Wall Street Journal",
    "Financial Times",
    "Benzinga",
    "The Motley Fool",
    "InvestorPlace",
  ];

  private constructor() {}

  static getInstance(): NewsReportService {
    if (!NewsReportService.instance) {
      NewsReportService.instance = new NewsReportService();
    }
    return NewsReportService.instance;
  }

  /**
   * Checks if a stock has recent news reports
   * @param reports Array of news reports to check
   * @returns Object containing presence check results
   */
  checkNewsPresence(reports: NewsReport[]): {
    hasRecentNews: boolean;
    recentNewsCount: number;
    hasRelevantNews: boolean;
    relevantNewsCount: number;
    averageSentiment: number;
    averageRelevance: number;
  } {
    if (!reports || reports.length === 0) {
      return {
        hasRecentNews: false,
        recentNewsCount: 0,
        hasRelevantNews: false,
        relevantNewsCount: 0,
        averageSentiment: 0,
        averageRelevance: 0,
      };
    }

    const recentReports = this.getRecentReports(reports);
    const relevantReports = this.getRelevantReports(recentReports);
    const sentimentScore = this.calculateAverageSentiment(recentReports);
    const relevanceScore = this.calculateAverageRelevance(recentReports);

    return {
      hasRecentNews: recentReports.length > 0,
      recentNewsCount: recentReports.length,
      hasRelevantNews: relevantReports.length > 0,
      relevantNewsCount: relevantReports.length,
      averageSentiment: sentimentScore,
      averageRelevance: relevanceScore,
    };
  }

  /**
   * Gets news reports from the last 7 days
   * @param reports Array of all news reports
   * @returns Array of recent reports
   */
  private getRecentReports(reports: NewsReport[]): NewsReport[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.RECENT_NEWS_DAYS);

    return reports.filter(
      (report) => report.publishedAt >= cutoffDate && report.isRecent
    );
  }

  /**
   * Gets relevant news reports based on source and relevance score
   * @param recentReports Array of recent news reports
   * @returns Array of relevant reports
   */
  private getRelevantReports(recentReports: NewsReport[]): NewsReport[] {
    return recentReports.filter(
      (report) =>
        this.RELEVANT_SOURCES.includes(report.source) || report.relevance >= 0.7
    );
  }

  /**
   * Calculates average sentiment score (-1 to 1)
   * @param reports Array of news reports
   * @returns Average sentiment score
   */
  private calculateAverageSentiment(reports: NewsReport[]): number {
    if (reports.length === 0) return 0;

    let positiveCount = 0;
    let negativeCount = 0;

    reports.forEach((report) => {
      if (report.sentiment === "positive") positiveCount++;
      else if (report.sentiment === "negative") negativeCount++;
    });

    return (positiveCount - negativeCount) / reports.length;
  }

  /**
   * Calculates average relevance score (0 to 1)
   * @param reports Array of news reports
   * @returns Average relevance score
   */
  private calculateAverageRelevance(reports: NewsReport[]): number {
    if (reports.length === 0) return 0;

    const relevanceSum = reports.reduce(
      (sum, report) => sum + report.relevance,
      0
    );
    return relevanceSum / reports.length;
  }

  /**
   * Checks if a news source is considered relevant
   * @param source The news source to check
   * @returns True if the source is relevant
   */
  isRelevantSource(source: string): boolean {
    return this.RELEVANT_SOURCES.includes(source);
  }

  /**
   * Gets the sentiment score for a news report
   * @param report The news report
   * @returns Sentiment score (-1 to 1)
   */
  getSentimentScore(report: NewsReport): number {
    switch (report.sentiment) {
      case "positive":
        return 1;
      case "negative":
        return -1;
      default:
        return 0;
    }
  }
}
