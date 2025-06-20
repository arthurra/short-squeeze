import { PriceDataPoint } from '../types/stock';

/**
 * Calculates the volume score component of the squeeze signal
 * @param currentVolume Current trading volume
 * @param priceHistory Array of historical price data points
 * @returns A score between 0-30 representing the volume component of the squeeze signal
 */
export function calculateVolumeScore(
  currentVolume: number,
  priceHistory: PriceDataPoint[],
): number {
  // Calculate 30-day average volume
  const averageVolume =
    priceHistory.reduce((sum, point) => sum + point.volume, 0) / priceHistory.length;

  // Calculate volume ratio (current volume / average volume)
  const volumeRatio = currentVolume / averageVolume;

  // Calculate volume trend (last 5 days vs previous 5 days)
  const last5DaysVolume = priceHistory.slice(-5).reduce((sum, point) => sum + point.volume, 0) / 5;
  const previous5DaysVolume =
    priceHistory.slice(-10, -5).reduce((sum, point) => sum + point.volume, 0) / 5;
  const volumeTrend = last5DaysVolume / previous5DaysVolume;

  // Calculate base score from volume ratio
  let score = 0;
  if (volumeRatio >= 3) {
    score = 30; // Maximum score for 3x or higher volume
  } else if (volumeRatio >= 2) {
    score = 20 + (volumeRatio - 2) * 10; // Linear interpolation between 2x and 3x
  } else if (volumeRatio >= 1.5) {
    score = 10 + (volumeRatio - 1.5) * 20; // Linear interpolation between 1.5x and 2x
  } else if (volumeRatio >= 1.2) {
    score = (volumeRatio - 1.2) * 33.33; // Linear interpolation between 1.2x and 1.5x
  }

  // Adjust score based on volume trend
  if (volumeTrend > 1.5) {
    score *= 1.2; // Boost score by 20% if volume is increasing
  } else if (volumeTrend < 0.8) {
    score *= 0.8; // Reduce score by 20% if volume is decreasing
  }

  // Ensure score stays within 0-30 range
  return Math.min(30, Math.max(0, score));
}

/**
 * Calculates the short interest score component of the squeeze signal
 * @param shortInterestPercent Current short interest percentage
 * @param marketCap Market capitalization in dollars
 * @param avgVolume Average daily trading volume
 * @returns A score between 0-40 representing the short interest component of the squeeze signal
 */
export function calculateShortInterestScore(
  shortInterestPercent: number,
  marketCap: number,
  avgVolume: number,
): number {
  // Base score from short interest percentage
  let score = 0;
  if (shortInterestPercent >= 50) {
    score = 40; // Maximum score for 50%+ short interest
  } else if (shortInterestPercent >= 40) {
    score = 35 + (shortInterestPercent - 40) * 0.5; // Linear interpolation between 40% and 50%
  } else if (shortInterestPercent >= 30) {
    score = 25 + (shortInterestPercent - 30); // Linear interpolation between 30% and 40%
  } else if (shortInterestPercent >= 20) {
    score = 15 + (shortInterestPercent - 20) * 1; // Linear interpolation between 20% and 30%
  } else if (shortInterestPercent >= 10) {
    score = (shortInterestPercent - 10) * 1.5; // Linear interpolation between 10% and 20%
  }

  // Calculate days to cover (short interest / average volume)
  const shortInterest = (shortInterestPercent / 100) * marketCap;
  const daysToCover = shortInterest / avgVolume;

  // Adjust score based on days to cover
  if (daysToCover >= 5) {
    score *= 1.2; // Boost score by 20% if it would take 5+ days to cover
  } else if (daysToCover >= 3) {
    score *= 1.1; // Boost score by 10% if it would take 3-5 days to cover
  } else if (daysToCover <= 1) {
    score *= 0.8; // Reduce score by 20% if it would take less than 1 day to cover
  }

  // Ensure score stays within 0-40 range
  return Math.min(40, Math.max(0, score));
}

/**
 * Calculates the trading flow score component of the squeeze signal
 * @param priceHistory Array of historical price data points
 * @returns A score between 0-15 representing the trading flow component of the squeeze signal
 */
export function calculateTradingFlowScore(priceHistory: PriceDataPoint[]): number {
  if (priceHistory.length < 5) {
    return 0;
  }

  // Calculate price and volume trends
  const recentPrices = priceHistory.slice(-5);
  const previousPrices = priceHistory.slice(-10, -5);

  // Calculate price momentum (last 5 days vs previous 5 days)
  const recentAvgPrice = recentPrices.reduce((sum, p) => sum + p.close, 0) / 5;
  const previousAvgPrice = previousPrices.reduce((sum, p) => sum + p.close, 0) / 5;
  const priceMomentum = (recentAvgPrice - previousAvgPrice) / previousAvgPrice;

  // Calculate volume momentum (last 5 days vs previous 5 days)
  const recentAvgVolume = recentPrices.reduce((sum, p) => sum + p.volume, 0) / 5;
  const previousAvgVolume = previousPrices.reduce((sum, p) => sum + p.volume, 0) / 5;
  const volumeMomentum = (recentAvgVolume - previousAvgVolume) / previousAvgVolume;

  // Calculate price volatility
  const priceChanges = recentPrices.map((p, i) =>
    i === 0 ? 0 : (p.close - recentPrices[i - 1].close) / recentPrices[i - 1].close,
  );
  const priceVolatility = Math.sqrt(
    priceChanges.reduce((sum, change) => sum + change * change, 0) / priceChanges.length,
  );

  // Calculate base score from price momentum
  let score = 0;
  if (priceMomentum > 0.1) {
    // 10%+ price increase
    score = 15;
  } else if (priceMomentum > 0.05) {
    // 5-10% price increase
    score = 10;
  } else if (priceMomentum > 0) {
    // 0-5% price increase
    score = 5;
  }

  // Adjust score based on volume momentum
  if (volumeMomentum > 0.5) {
    // 50%+ volume increase
    score *= 1.2;
  } else if (volumeMomentum > 0.2) {
    // 20-50% volume increase
    score *= 1.1;
  } else if (volumeMomentum < -0.2) {
    // 20%+ volume decrease
    score *= 0.8;
  }

  // Adjust score based on price volatility
  if (priceVolatility > 0.1) {
    // High volatility
    score *= 1.2;
  } else if (priceVolatility < 0.02) {
    // Low volatility
    score *= 0.8;
  }

  // Ensure score stays within 0-15 range
  return Math.min(15, Math.max(0, score));
}

interface SECFiling {
  type: string;
  filedAt: number;
  description: string;
}

/**
 * Calculates the SEC filing score component of the squeeze signal
 * @param recentFilings Array of recent SEC filings
 * @returns A score between 0-15 representing the SEC filing component of the squeeze signal
 */
export function calculateSECFilingScore(recentFilings: SECFiling[]): number {
  if (!recentFilings.length) {
    return 0;
  }

  // Define filing weights and time windows
  const filingWeights: Record<string, number> = {
    'S-1': 15, // New stock registration
    'S-3': 10, // Shelf registration
    '8-K': 5, // Material events
    '10-K': 3, // Annual report
    '10-Q': 2, // Quarterly report
  };

  // Calculate time-based decay factor (30 days)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  // Calculate weighted score for each filing
  const scores = recentFilings.map((filing) => {
    const weight = filingWeights[filing.type] || 1;
    const daysOld = (Date.now() - filing.filedAt) / (24 * 60 * 60 * 1000);
    const timeDecay = Math.max(0, 1 - daysOld / 30); // Linear decay over 30 days
    return weight * timeDecay;
  });

  // Sum up all scores and cap at 15
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  return Math.min(15, totalScore);
}

interface NewsArticle {
  title: string;
  publishedAt: number;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
}

/**
 * Calculates the news report score component of the squeeze signal
 * @param recentNews Array of recent news articles
 * @returns A score between 0-15 representing the news component of the squeeze signal
 */
export function calculateNewsScore(recentNews: NewsArticle[]): number {
  if (!recentNews.length) {
    return 0;
  }

  // Define source weights (higher for more reputable sources)
  const sourceWeights: Record<string, number> = {
    Bloomberg: 1.5,
    Reuters: 1.5,
    'Wall Street Journal': 1.5,
    CNBC: 1.3,
    MarketWatch: 1.3,
    'Seeking Alpha': 1.2,
    Benzinga: 1.2,
    'Yahoo Finance': 1.1,
  };

  // Define sentiment weights
  const sentimentWeights: Record<string, number> = {
    positive: 1.2,
    negative: 0.8,
    neutral: 1.0,
  };

  // Calculate time-based decay factor (7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  // Calculate weighted score for each article
  const scores = recentNews.map((article) => {
    // Base score of 5 points per article
    let score = 5;

    // Apply source weight
    const sourceWeight = sourceWeights[article.source] || 1.0;
    score *= sourceWeight;

    // Apply sentiment weight
    score *= sentimentWeights[article.sentiment];

    // Apply time decay (linear over 7 days)
    const daysOld = (Date.now() - article.publishedAt) / (24 * 60 * 60 * 1000);
    const timeDecay = Math.max(0, 1 - daysOld / 7);
    score *= timeDecay;

    return score;
  });

  // Sum up all scores and cap at 15
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  return Math.min(15, totalScore);
}

interface SocialMediaPost {
  platform: 'reddit' | 'twitter' | 'stocktwits';
  timestamp: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  sentiment: 'bullish' | 'bearish' | 'neutral';
  isVerified: boolean;
}

/**
 * Calculates the social media buzz score component of the squeeze signal
 * @param recentPosts Array of recent social media posts
 * @returns A score between 0-15 representing the social media buzz component of the squeeze signal
 */
export function calculateSocialBuzzScore(recentPosts: SocialMediaPost[]): number {
  if (!recentPosts.length) {
    return 0;
  }

  // Define platform weights
  const platformWeights: Record<string, number> = {
    reddit: 1.3, // Higher weight for Reddit due to WSB influence
    twitter: 1.2, // Twitter has good market sentiment
    stocktwits: 1.1, // StockTwits is more niche
  };

  // Define sentiment weights
  const sentimentWeights: Record<string, number> = {
    bullish: 1.2,
    neutral: 1.0,
    bearish: 0.8,
  };

  // Calculate time-based decay factor (3 days)
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;

  // Calculate engagement score for each post
  const scores = recentPosts.map((post) => {
    // Calculate base engagement score
    const engagementScore =
      post.engagement.likes * 0.4 + // 40% weight for likes
      post.engagement.comments * 0.4 + // 40% weight for comments
      post.engagement.shares * 0.2; // 20% weight for shares

    // Apply platform weight
    const platformWeight = platformWeights[post.platform] || 1.0;
    let score = engagementScore * platformWeight;

    // Apply sentiment weight
    score *= sentimentWeights[post.sentiment];

    // Apply verified user bonus
    if (post.isVerified) {
      score *= 1.2;
    }

    // Apply time decay (linear over 3 days)
    const hoursOld = (Date.now() - post.timestamp) / (60 * 60 * 1000);
    const timeDecay = Math.max(0, 1 - hoursOld / (3 * 24));
    score *= timeDecay;

    return score;
  });

  // Normalize scores to fit 0-15 range
  const maxPossibleScore = 1000; // Arbitrary max engagement score
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const normalizedScore = (totalScore / maxPossibleScore) * 15;

  return Math.min(15, Math.max(0, normalizedScore));
}

interface SqueezeSignalInput {
  currentVolume: number;
  priceHistory: PriceDataPoint[];
  shortInterestPercent: number;
  marketCap: number;
  avgVolume: number;
  recentFilings: SECFiling[];
  recentNews: NewsArticle[];
  recentSocialPosts: SocialMediaPost[];
}

/**
 * Calculates the final squeeze signal score (0-100) by combining all individual components
 * @param input Object containing all required data for score calculation
 * @returns A score between 0-100 representing the overall squeeze signal
 */
export function calculateSqueezeSignal(input: SqueezeSignalInput): number {
  // Calculate individual component scores
  const volumeScore = calculateVolumeScore(input.currentVolume, input.priceHistory);
  const shortInterestScore = calculateShortInterestScore(
    input.shortInterestPercent,
    input.marketCap,
    input.avgVolume,
  );
  const tradingFlowScore = calculateTradingFlowScore(input.priceHistory);
  const secFilingScore = calculateSECFilingScore(input.recentFilings);
  const newsScore = calculateNewsScore(input.recentNews);
  const socialBuzzScore = calculateSocialBuzzScore(input.recentSocialPosts);

  // Define component weights (must sum to 1.0)
  const weights = {
    volume: 0.25, // 25% - Volume is a key indicator
    shortInterest: 0.25, // 25% - Short interest is equally important
    tradingFlow: 0.15, // 15% - Trading patterns provide context
    secFiling: 0.1, // 10% - SEC filings indicate corporate actions
    news: 0.15, // 15% - News coverage shows market attention
    socialBuzz: 0.1, // 10% - Social media shows retail interest
  };

  // Calculate weighted sum
  const weightedSum =
    volumeScore * weights.volume +
    shortInterestScore * weights.shortInterest +
    tradingFlowScore * weights.tradingFlow +
    secFilingScore * weights.secFiling +
    newsScore * weights.news +
    socialBuzzScore * weights.socialBuzz;

  // Convert to 0-100 scale
  const maxPossibleScore =
    30 * weights.volume + // Volume score max: 30
    40 * weights.shortInterest + // Short interest score max: 40
    15 * weights.tradingFlow + // Trading flow score max: 15
    15 * weights.secFiling + // SEC filing score max: 15
    15 * weights.news + // News score max: 15
    15 * weights.socialBuzz; // Social buzz score max: 15

  const normalizedScore = (weightedSum / maxPossibleScore) * 100;

  // Ensure score stays within 0-100 range
  return Math.min(100, Math.max(0, normalizedScore));
}
