import '@testing-library/jest-dom';
import { expect } from '@jest/globals';
import {
  calculateVolumeScore,
  calculateShortInterestScore,
  calculateTradingFlowScore,
  calculateSECFilingScore,
  calculateNewsScore,
  calculateSocialBuzzScore,
  calculateSqueezeSignal,
} from './squeezeScore';
import { PriceDataPoint } from '../types/stock';

describe('Squeeze Score Calculations', () => {
  describe('calculateVolumeScore', () => {
    const createMockPriceHistory = (volumes: number[]): PriceDataPoint[] => {
      return volumes.map((volume, index) => ({
        timestamp: Date.now() - (30 - index) * 24 * 60 * 60 * 1000,
        open: 1,
        high: 1,
        low: 1,
        close: 1,
        volume,
      }));
    };

    it('should return maximum score for 3x volume', () => {
      const averageVolume = 1000000;
      const currentVolume = 3000000;
      const priceHistory = createMockPriceHistory(Array(30).fill(averageVolume));

      const score = calculateVolumeScore(currentVolume, priceHistory);
      expect(score).toBe(30);
    });

    it('should return 0 for volume below 1.2x average', () => {
      const averageVolume = 1000000;
      const currentVolume = 1100000;
      const priceHistory = createMockPriceHistory(Array(30).fill(averageVolume));

      const score = calculateVolumeScore(currentVolume, priceHistory);
      expect(score).toBe(0);
    });

    it('should calculate correct score for 2x volume', () => {
      const averageVolume = 1000000;
      const currentVolume = 2000000;
      const priceHistory = createMockPriceHistory(Array(30).fill(averageVolume));

      const score = calculateVolumeScore(currentVolume, priceHistory);
      expect(score).toBe(20);
    });

    it('should boost score for increasing volume trend', () => {
      const averageVolume = 1000000;
      const currentVolume = 2000000;
      // Create price history with increasing volume trend
      const volumes = Array(30)
        .fill(averageVolume)
        .map((v, i) => v * (1 + i * 0.1));
      const priceHistory = createMockPriceHistory(volumes);

      const score = calculateVolumeScore(currentVolume, priceHistory);
      expect(score).toBeGreaterThan(20); // Should be boosted above base score
    });

    it('should reduce score for decreasing volume trend', () => {
      const averageVolume = 1000000;
      const currentVolume = 2000000;
      // Create price history with decreasing volume trend
      const volumes = Array(30)
        .fill(averageVolume)
        .map((v, i) => v * (1 - i * 0.1));
      const priceHistory = createMockPriceHistory(volumes);

      const score = calculateVolumeScore(currentVolume, priceHistory);
      expect(score).toBeLessThan(20); // Should be reduced below base score
    });

    it('should handle edge cases', () => {
      const priceHistory = createMockPriceHistory(Array(30).fill(1000000));

      // Test with zero volume
      expect(calculateVolumeScore(0, priceHistory)).toBe(0);

      // Test with very high volume
      expect(calculateVolumeScore(10000000, priceHistory)).toBe(30);

      // Test with empty price history
      expect(calculateVolumeScore(1000000, [])).toBe(0);
    });
  });

  describe('calculateShortInterestScore', () => {
    it('should return maximum score for 50%+ short interest', () => {
      const score = calculateShortInterestScore(55, 100000000, 1000000);
      expect(score).toBe(40);
    });

    it('should return 0 for short interest below 10%', () => {
      const score = calculateShortInterestScore(5, 100000000, 1000000);
      expect(score).toBe(0);
    });

    it('should calculate correct score for 30% short interest', () => {
      const score = calculateShortInterestScore(30, 100000000, 1000000);
      expect(score).toBe(25);
    });

    it('should boost score for high days to cover', () => {
      // Market cap: $100M, Short interest: 40%, Avg volume: 1M
      // This means 40M shares short / 1M daily volume = 40 days to cover
      const score = calculateShortInterestScore(40, 100000000, 1000000);
      expect(score).toBeGreaterThan(35); // Should be boosted above base score
    });

    it('should reduce score for low days to cover', () => {
      // Market cap: $100M, Short interest: 20%, Avg volume: 20M
      // This means 20M shares short / 20M daily volume = 1 day to cover
      const score = calculateShortInterestScore(20, 100000000, 20000000);
      expect(score).toBeLessThan(15); // Should be reduced below base score
    });

    it('should handle edge cases', () => {
      // Test with zero values
      expect(calculateShortInterestScore(0, 0, 0)).toBe(0);

      // Test with very high values
      expect(calculateShortInterestScore(100, 1000000000, 1000000)).toBe(40);

      // Test with negative values
      expect(calculateShortInterestScore(-10, 100000000, 1000000)).toBe(0);
    });
  });

  describe('calculateTradingFlowScore', () => {
    const createMockPriceHistory = (prices: number[], volumes: number[]): PriceDataPoint[] => {
      return prices.map((price, i) => ({
        timestamp: Date.now() - (30 - i) * 24 * 60 * 60 * 1000,
        open: price,
        high: price * 1.1,
        low: price * 0.9,
        close: price,
        volume: volumes[i],
      }));
    };

    it('should return maximum score for strong upward momentum', () => {
      // Create price history with 15% price increase and 60% volume increase
      const prices = Array(10)
        .fill(1)
        .map((p, i) => p * (1 + i * 0.015));
      const volumes = Array(10)
        .fill(1000000)
        .map((v, i) => v * (1 + i * 0.06));
      const priceHistory = createMockPriceHistory(prices, volumes);

      const score = calculateTradingFlowScore(priceHistory);
      expect(score).toBe(15);
    });

    it('should return 0 for insufficient price history', () => {
      const priceHistory = createMockPriceHistory([1, 2, 3], [1000000, 1000000, 1000000]);
      const score = calculateTradingFlowScore(priceHistory);
      expect(score).toBe(0);
    });

    it('should calculate correct score for moderate momentum', () => {
      // Create price history with 7% price increase and 30% volume increase
      const prices = Array(10)
        .fill(1)
        .map((p, i) => p * (1 + i * 0.007));
      const volumes = Array(10)
        .fill(1000000)
        .map((v, i) => v * (1 + i * 0.03));
      const priceHistory = createMockPriceHistory(prices, volumes);

      const score = calculateTradingFlowScore(priceHistory);
      expect(score).toBeGreaterThan(10);
      expect(score).toBeLessThan(15);
    });

    it('should boost score for high volatility', () => {
      // Create price history with high volatility (alternating 5% up and down)
      const prices = Array(10)
        .fill(1)
        .map((p, i) => p * (1 + (i % 2 ? 0.05 : -0.05)));
      const volumes = Array(10).fill(1000000);
      const priceHistory = createMockPriceHistory(prices, volumes);

      const score = calculateTradingFlowScore(priceHistory);
      expect(score).toBeGreaterThan(5); // Should be boosted by volatility
    });

    it('should reduce score for low volatility', () => {
      // Create price history with very low volatility (0.5% daily changes)
      const prices = Array(10)
        .fill(1)
        .map((p, i) => p * (1 + (i % 2 ? 0.005 : -0.005)));
      const volumes = Array(10).fill(1000000);
      const priceHistory = createMockPriceHistory(prices, volumes);

      const score = calculateTradingFlowScore(priceHistory);
      expect(score).toBeLessThan(5); // Should be reduced by low volatility
    });

    it('should handle edge cases', () => {
      // Test with empty price history
      expect(calculateTradingFlowScore([])).toBe(0);

      // Test with constant prices
      const constantPrices = Array(10).fill(1);
      const constantVolumes = Array(10).fill(1000000);
      const constantHistory = createMockPriceHistory(constantPrices, constantVolumes);
      expect(calculateTradingFlowScore(constantHistory)).toBe(0);

      // Test with zero prices
      const zeroPrices = Array(10).fill(0);
      const zeroVolumes = Array(10).fill(0);
      const zeroHistory = createMockPriceHistory(zeroPrices, zeroVolumes);
      expect(calculateTradingFlowScore(zeroHistory)).toBe(0);
    });
  });

  describe('calculateSECFilingScore', () => {
    const createMockFiling = (type: string, daysAgo: number) => ({
      type,
      filedAt: Date.now() - daysAgo * 24 * 60 * 60 * 1000,
      description: `Test ${type} filing`,
    });

    it('should return maximum score for recent S-1 filing', () => {
      const filings = [createMockFiling('S-1', 1)];
      const score = calculateSECFilingScore(filings);
      expect(score).toBe(15);
    });

    it('should return 0 for no filings', () => {
      const score = calculateSECFilingScore([]);
      expect(score).toBe(0);
    });

    it('should calculate correct score for multiple recent filings', () => {
      const filings = [
        createMockFiling('S-3', 5), // 10 points * 0.83 decay = 8.3
        createMockFiling('8-K', 2), // 5 points * 0.93 decay = 4.65
        createMockFiling('10-K', 1), // 3 points * 0.97 decay = 2.91
      ];
      const score = calculateSECFilingScore(filings);
      expect(score).toBe(15); // Should be capped at 15
    });

    it('should apply time decay to older filings', () => {
      const filings = [
        createMockFiling('S-1', 15), // 15 points * 0.5 decay = 7.5
        createMockFiling('S-3', 20), // 10 points * 0.33 decay = 3.3
      ];
      const score = calculateSECFilingScore(filings);
      expect(score).toBeLessThan(15); // Should be reduced by time decay
    });

    it('should handle filings older than 30 days', () => {
      const filings = [createMockFiling('S-1', 31)];
      const score = calculateSECFilingScore(filings);
      expect(score).toBe(0); // Should be 0 for filings older than 30 days
    });

    it('should handle unknown filing types', () => {
      const filings = [createMockFiling('UNKNOWN', 1)];
      const score = calculateSECFilingScore(filings);
      expect(score).toBeLessThan(1); // Should use default weight of 1
    });

    it('should handle edge cases', () => {
      // Test with invalid filing dates
      const invalidFiling = {
        type: 'S-1',
        filedAt: Date.now() + 1000000, // Future date
        description: 'Invalid filing',
      };
      expect(calculateSECFilingScore([invalidFiling])).toBe(0);

      // Test with very old filings
      const oldFiling = createMockFiling('S-1', 100);
      expect(calculateSECFilingScore([oldFiling])).toBe(0);
    });
  });

  describe('calculateNewsScore', () => {
    const createMockArticle = (
      source: string,
      sentiment: 'positive' | 'negative' | 'neutral',
      daysAgo: number,
    ) => ({
      title: `Test article from ${source}`,
      publishedAt: Date.now() - daysAgo * 24 * 60 * 60 * 1000,
      source,
      sentiment,
      summary: `This is a ${sentiment} article about the stock.`,
    });

    it('should return maximum score for recent positive news from reputable sources', () => {
      const articles = [
        createMockArticle('Bloomberg', 'positive', 1), // 5 * 1.5 * 1.2 * 0.86 = 7.74
        createMockArticle('Reuters', 'positive', 2), // 5 * 1.5 * 1.2 * 0.71 = 6.39
      ];
      const score = calculateNewsScore(articles);
      expect(score).toBe(15); // Should be capped at 15
    });

    it('should return 0 for no news', () => {
      const score = calculateNewsScore([]);
      expect(score).toBe(0);
    });

    it('should calculate correct score for mixed news', () => {
      const articles = [
        createMockArticle('CNBC', 'positive', 1), // 5 * 1.3 * 1.2 * 0.86 = 6.71
        createMockArticle('MarketWatch', 'neutral', 2), // 5 * 1.3 * 1.0 * 0.71 = 4.62
        createMockArticle('Yahoo Finance', 'negative', 3), // 5 * 1.1 * 0.8 * 0.57 = 2.51
      ];
      const score = calculateNewsScore(articles);
      expect(score).toBeLessThan(15); // Should be less than max
      expect(score).toBeGreaterThan(0); // Should be greater than 0
    });

    it('should apply time decay to older articles', () => {
      const articles = [
        createMockArticle('Bloomberg', 'positive', 6), // 5 * 1.5 * 1.2 * 0.14 = 1.26
        createMockArticle('Reuters', 'positive', 7), // 5 * 1.5 * 1.2 * 0 = 0
      ];
      const score = calculateNewsScore(articles);
      expect(score).toBeLessThan(2); // Should be significantly reduced by time decay
    });

    it('should handle articles older than 7 days', () => {
      const articles = [createMockArticle('Bloomberg', 'positive', 8)];
      const score = calculateNewsScore(articles);
      expect(score).toBe(0); // Should be 0 for articles older than 7 days
    });

    it('should handle unknown news sources', () => {
      const articles = [createMockArticle('Unknown Source', 'positive', 1)];
      const score = calculateNewsScore(articles);
      expect(score).toBeLessThan(6); // Should use default weight of 1.0
    });

    it('should handle edge cases', () => {
      // Test with future dates
      const futureArticle = {
        title: 'Future article',
        publishedAt: Date.now() + 1000000,
        source: 'Bloomberg',
        sentiment: 'positive' as const,
        summary: 'Future article',
      };
      expect(calculateNewsScore([futureArticle])).toBe(0);

      // Test with very old articles
      const oldArticle = createMockArticle('Bloomberg', 'positive', 100);
      expect(calculateNewsScore([oldArticle])).toBe(0);
    });
  });

  describe('calculateSocialBuzzScore', () => {
    const createMockPost = (
      platform: 'reddit' | 'twitter' | 'stocktwits',
      sentiment: 'bullish' | 'bearish' | 'neutral',
      hoursAgo: number,
      engagement: { likes: number; comments: number; shares: number },
      isVerified: boolean = false,
    ) => ({
      platform,
      timestamp: Date.now() - hoursAgo * 60 * 60 * 1000,
      engagement,
      sentiment,
      isVerified,
    });

    it('should return maximum score for high-engagement verified posts', () => {
      const posts = [
        createMockPost('reddit', 'bullish', 1, { likes: 1000, comments: 500, shares: 200 }, true),
        createMockPost('twitter', 'bullish', 2, { likes: 800, comments: 300, shares: 150 }, true),
      ];
      const score = calculateSocialBuzzScore(posts);
      expect(score).toBe(15); // Should be capped at 15
    });

    it('should return 0 for no posts', () => {
      const score = calculateSocialBuzzScore([]);
      expect(score).toBe(0);
    });

    it('should calculate correct score for mixed engagement', () => {
      const posts = [
        createMockPost('reddit', 'bullish', 1, { likes: 500, comments: 200, shares: 100 }),
        createMockPost('stocktwits', 'neutral', 2, { likes: 300, comments: 100, shares: 50 }),
      ];
      const score = calculateSocialBuzzScore(posts);
      expect(score).toBeLessThan(15); // Should be less than max
      expect(score).toBeGreaterThan(0); // Should be greater than 0
    });

    it('should apply time decay to older posts', () => {
      const posts = [
        createMockPost(
          'reddit',
          'bullish',
          48, // 2 days old
          { likes: 1000, comments: 500, shares: 200 },
        ),
        createMockPost(
          'twitter',
          'bullish',
          72, // 3 days old
          { likes: 800, comments: 300, shares: 150 },
        ),
      ];
      const score = calculateSocialBuzzScore(posts);
      expect(score).toBeLessThan(5); // Should be significantly reduced by time decay
    });

    it('should handle posts older than 3 days', () => {
      const posts = [
        createMockPost(
          'reddit',
          'bullish',
          73, // Just over 3 days old
          { likes: 1000, comments: 500, shares: 200 },
        ),
      ];
      const score = calculateSocialBuzzScore(posts);
      expect(score).toBe(0); // Should be 0 for posts older than 3 days
    });

    it('should weight platforms correctly', () => {
      const redditPost = createMockPost('reddit', 'bullish', 1, {
        likes: 100,
        comments: 50,
        shares: 20,
      });
      const twitterPost = createMockPost('twitter', 'bullish', 1, {
        likes: 100,
        comments: 50,
        shares: 20,
      });
      const stocktwitsPost = createMockPost('stocktwits', 'bullish', 1, {
        likes: 100,
        comments: 50,
        shares: 20,
      });

      const redditScore = calculateSocialBuzzScore([redditPost]);
      const twitterScore = calculateSocialBuzzScore([twitterPost]);
      const stocktwitsScore = calculateSocialBuzzScore([stocktwitsPost]);

      expect(redditScore).toBeGreaterThan(twitterScore);
      expect(twitterScore).toBeGreaterThan(stocktwitsScore);
    });

    it('should handle edge cases', () => {
      // Test with future timestamps
      const futurePost = {
        platform: 'reddit' as const,
        timestamp: Date.now() + 1000000,
        engagement: { likes: 1000, comments: 500, shares: 200 },
        sentiment: 'bullish' as const,
        isVerified: true,
      };
      expect(calculateSocialBuzzScore([futurePost])).toBe(0);

      // Test with zero engagement
      const zeroEngagementPost = createMockPost('reddit', 'bullish', 1, {
        likes: 0,
        comments: 0,
        shares: 0,
      });
      expect(calculateSocialBuzzScore([zeroEngagementPost])).toBe(0);
    });
  });

  describe('calculateSqueezeSignal', () => {
    const mockInput = {
      currentVolume: 1000000,
      priceHistory: [
        {
          timestamp: Date.now() - 86400000,
          open: 0.95,
          high: 1.05,
          low: 0.9,
          close: 1.0,
          volume: 500000,
        },
        {
          timestamp: Date.now(),
          open: 1.15,
          high: 1.25,
          low: 1.1,
          close: 1.2,
          volume: 1000000,
        },
      ],
      shortInterestPercent: 30,
      marketCap: 100000000,
      avgVolume: 500000,
      recentFilings: [
        {
          type: '8-K',
          timestamp: Date.now() - 86400000,
          filedAt: Date.now() - 86400000,
          description: 'Material Event',
          url: 'https://example.com',
        },
      ],
      recentNews: [
        {
          title: 'Test News',
          source: 'Test Source',
          timestamp: Date.now() - 43200000,
          publishedAt: Date.now() - 43200000,
          summary: 'This is a test news article',
          url: 'https://example.com',
          sentiment: 'positive' as const,
        },
      ],
      recentSocialPosts: [
        {
          platform: 'reddit' as const,
          content: 'Test Post',
          timestamp: Date.now() - 21600000,
          engagement: {
            likes: 100,
            comments: 50,
            shares: 25,
          },
          sentiment: 'bullish' as const,
          isVerified: true,
        },
      ],
    };

    it('should calculate a score between 0 and 100', () => {
      const score = calculateSqueezeSignal(mockInput);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 for stocks with no squeeze signals', () => {
      const noSignalInput = {
        ...mockInput,
        currentVolume: 1000,
        shortInterestPercent: 1,
        recentFilings: [],
        recentNews: [],
        recentSocialPosts: [],
      };
      const score = calculateSqueezeSignal(noSignalInput);
      expect(score).toBe(0);
    });

    it('should return high score for stocks with multiple strong signals', () => {
      const strongSignalInput = {
        ...mockInput,
        currentVolume: 5000000, // 10x average volume
        shortInterestPercent: 50, // Very high short interest
        recentFilings: [
          {
            type: '8-K',
            timestamp: Date.now() - 3600000,
            filedAt: Date.now() - 3600000,
            description: 'Material Event',
            url: 'https://example.com',
          },
        ],
        recentNews: [
          {
            title: 'Breaking News',
            source: 'Major Source',
            timestamp: Date.now() - 3600000,
            publishedAt: Date.now() - 3600000,
            summary: 'This is breaking news about a significant event',
            url: 'https://example.com',
            sentiment: 'positive' as const,
          },
        ],
        recentSocialPosts: [
          {
            platform: 'reddit' as const,
            content: 'Viral Post',
            timestamp: Date.now() - 3600000,
            engagement: {
              likes: 10000,
              comments: 5000,
              shares: 2500,
            },
            sentiment: 'positive' as const,
            isVerified: true,
          },
        ],
      };
      const score = calculateSqueezeSignal(strongSignalInput);
      expect(score).toBeGreaterThan(80);
    });

    it('should properly weight different components', () => {
      // Test with only volume spike
      const volumeOnlyInput = {
        ...mockInput,
        currentVolume: 5000000,
        shortInterestPercent: 1,
        recentFilings: [],
        recentNews: [],
        recentSocialPosts: [],
      };
      const volumeOnlyScore = calculateSqueezeSignal(volumeOnlyInput);

      // Test with only short interest
      const shortInterestOnlyInput = {
        ...mockInput,
        currentVolume: 1000,
        shortInterestPercent: 50,
        recentFilings: [],
        recentNews: [],
        recentSocialPosts: [],
      };
      const shortInterestOnlyScore = calculateSqueezeSignal(shortInterestOnlyInput);

      // Volume and short interest should have similar impact due to equal weights
      expect(Math.abs(volumeOnlyScore - shortInterestOnlyScore)).toBeLessThan(20);
    });

    it('should handle edge cases gracefully', () => {
      const edgeCaseInput = {
        ...mockInput,
        currentVolume: 0,
        shortInterestPercent: 0,
        marketCap: 0,
        avgVolume: 0,
        priceHistory: [],
        recentFilings: [],
        recentNews: [],
        recentSocialPosts: [],
      };
      const score = calculateSqueezeSignal(edgeCaseInput);
      expect(score).toBe(0);
    });
  });
});
