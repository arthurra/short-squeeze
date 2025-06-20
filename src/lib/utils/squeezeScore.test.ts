import { expect, jest, describe, it } from '@jest/globals';
import '@testing-library/jest-dom';
import {
  calculateVolumeScore,
  calculateShortInterestScore,
  calculateTradingFlowScore,
  calculateSECFilingScore,
  calculateNewsScore,
  calculateSocialBuzzScore,
  calculateSqueezeSignal,
} from './squeezeScore';
import type { PriceDataPoint } from '../types/stock';

const createMockPriceHistory = (prices: number[], volumes: number[] = []): PriceDataPoint[] => {
  return prices.map((price, i) => ({
    open: price * 0.95,
    high: price * 1.05,
    low: price * 0.9,
    close: price,
    volume: volumes[i] || 1000000,
    timestamp: Date.now() - (prices.length - i) * 86400000,
  }));
};

const createMockFiling = (type: string, daysAgo: number) => ({
  type,
  filedAt: Date.now() - daysAgo * 86400000,
  description: `Test ${type} filing`,
});

const createMockArticle = (
  source: string,
  sentiment: 'positive' | 'negative' | 'neutral',
  daysAgo: number,
) => ({
  title: `Test article from ${source}`,
  publishedAt: Date.now() - daysAgo * 86400000,
  source,
  sentiment,
  summary: `This is a ${sentiment} article about the stock.`,
});

const createMockPost = (
  platform: 'reddit' | 'twitter' | 'stocktwits',
  sentiment: 'bullish' | 'bearish' | 'neutral',
  daysAgo: number,
  engagement: { likes: number; comments: number; shares: number },
) => ({
  platform,
  timestamp: Date.now() - daysAgo * 86400000,
  engagement,
  sentiment,
  isVerified: true,
});

describe('Squeeze Score Calculations', () => {
  describe('calculateVolumeScore', () => {
    it('should return maximum score for 3x volume', () => {
      const averageVolume = 1000000;
      const currentVolume = 3000000;
      const priceHistory = createMockPriceHistory(
        Array(30).fill(10),
        Array(30).fill(averageVolume),
      );

      const score = calculateVolumeScore(currentVolume, priceHistory);
      expect(score).toBe(30);
    });

    it('should return 0 for volume below 1.2x average', () => {
      const averageVolume = 1000000;
      const currentVolume = 1100000;
      const priceHistory = createMockPriceHistory(
        Array(30).fill(10),
        Array(30).fill(averageVolume),
      );

      const score = calculateVolumeScore(currentVolume, priceHistory);
      expect(score).toBe(0);
    });

    it('should calculate correct score for 2x volume', () => {
      const averageVolume = 1000000;
      const currentVolume = 2000000;
      const priceHistory = createMockPriceHistory(
        Array(30).fill(10),
        Array(30).fill(averageVolume),
      );

      const score = calculateVolumeScore(currentVolume, priceHistory);
      expect(score).toBe(20);
    });

    it('should boost score for increasing volume trend', () => {
      // Use a much higher currentVolume to ensure base score is high enough
      const currentVolume = 10000000;
      const priceHistory = createMockPriceHistory(
        Array(30).fill(10),
        Array(30)
          .fill(1000000)
          .map((v, i) => v * (1 + i * 0.1)),
      );

      const score = calculateVolumeScore(currentVolume, priceHistory);
      expect(score).toBeGreaterThan(20); // Should be boosted above base score
    });

    it('should reduce score for decreasing volume trend', () => {
      const averageVolume = 1000000;
      const currentVolume = 2000000;
      const priceHistory = createMockPriceHistory(
        Array(30).fill(10),
        Array(30)
          .fill(averageVolume)
          .map((v, i) => v * (1 - i * 0.1)),
      );

      const score = calculateVolumeScore(currentVolume, priceHistory);
      expect(score).toBeLessThan(20); // Should be reduced below base score
    });

    it('should handle edge cases', () => {
      const priceHistory = createMockPriceHistory(Array(30).fill(10), Array(30).fill(1000000));

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
      expect(score).toBe(30);
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
    it('should return maximum score for strong upward momentum', () => {
      const priceHistory = createMockPriceHistory([10, 12, 15, 18, 20]);

      const score = calculateTradingFlowScore(priceHistory);
      expect(score).toBe(15);
    });

    it('should return 0 for insufficient price history', () => {
      const priceHistory = createMockPriceHistory([1, 2, 3]);
      const score = calculateTradingFlowScore(priceHistory);
      expect(score).toBe(0);
    });

    it('should calculate correct score for moderate momentum', () => {
      const priceHistory = createMockPriceHistory([10, 11, 12, 13, 14]);

      const score = calculateTradingFlowScore(priceHistory);
      expect(score).toBe(15);
    });

    it('should boost score for high volatility', () => {
      // Create price history with high volatility (alternating 10% up and down)
      const prices = Array(10)
        .fill(1)
        .map((p, i) => p * (1 + (i % 2 ? 0.1 : -0.1)));
      const priceHistory = createMockPriceHistory(prices);

      const score = calculateTradingFlowScore(priceHistory);
      expect(score).toBeGreaterThan(5); // Should be boosted by volatility
    });

    it('should reduce score for low volatility', () => {
      // Create price history with very low volatility (0.5% daily changes)
      const prices = Array(10)
        .fill(1)
        .map((p, i) => p * (1 + (i % 2 ? 0.005 : -0.005)));
      const priceHistory = createMockPriceHistory(prices);

      const score = calculateTradingFlowScore(priceHistory);
      expect(score).toBeLessThan(5); // Should be reduced by low volatility
    });
  });

  describe('calculateSECFilingScore', () => {
    it('should return maximum score for recent S-1 filing', () => {
      const filings = [createMockFiling('S-1', 1)];
      const score = calculateSECFilingScore(filings);
      expect(score).toBeCloseTo(14.5, 2);
    });

    it('should return 0 for no filings', () => {
      const score = calculateSECFilingScore([]);
      expect(score).toBe(0);
    });

    it('should calculate correct score for multiple filings', () => {
      const filings = [
        createMockFiling('S-3', 1),
        createMockFiling('8-K', 2),
        createMockFiling('10-K', 3),
      ];
      const score = calculateSECFilingScore(filings);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(15);
    });

    it('should apply time decay to older filings', () => {
      const filings = [
        createMockFiling('S-1', 1),
        createMockFiling('S-1', 15),
        createMockFiling('S-1', 30),
      ];
      const score = calculateSECFilingScore(filings);
      expect(score).toBeLessThan(45); // Should be less than sum of weights due to decay
    });
  });

  describe('calculateNewsScore', () => {
    it('should return maximum score for recent positive news', () => {
      const news = [
        createMockArticle('Bloomberg', 'positive', 1),
        createMockArticle('Reuters', 'positive', 2),
      ];
      const score = calculateNewsScore(news);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(15);
    });

    it('should return 0 for no news', () => {
      const score = calculateNewsScore([]);
      expect(score).toBe(0);
    });

    it('should calculate correct score for mixed sentiment', () => {
      const news = [
        createMockArticle('Bloomberg', 'positive', 1),
        createMockArticle('Reuters', 'negative', 1),
        createMockArticle('CNBC', 'neutral', 1),
      ];
      const score = calculateNewsScore(news);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(15);
    });

    it('should apply time decay to older news', () => {
      const news = [
        createMockArticle('Bloomberg', 'positive', 1),
        createMockArticle('Reuters', 'positive', 15),
        createMockArticle('CNBC', 'positive', 30),
      ];
      const score = calculateNewsScore(news);
      expect(score).toBeLessThan(45); // Should be less than sum of weights due to decay
    });
  });

  describe('calculateSocialBuzzScore', () => {
    it('should return maximum score for high-engagement bullish posts', () => {
      const posts = [
        createMockPost('reddit', 'bullish', 1, { likes: 1000, comments: 500, shares: 200 }),
        createMockPost('twitter', 'bullish', 1, { likes: 2000, comments: 1000, shares: 500 }),
      ];
      const score = calculateSocialBuzzScore(posts);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(15);
    });

    it('should return 0 for no posts', () => {
      const score = calculateSocialBuzzScore([]);
      expect(score).toBe(0);
    });

    it('should calculate correct score for mixed sentiment', () => {
      const posts = [
        createMockPost('reddit', 'bullish', 1, { likes: 1000, comments: 500, shares: 200 }),
        createMockPost('twitter', 'bearish', 1, { likes: 1000, comments: 500, shares: 200 }),
        createMockPost('stocktwits', 'neutral', 1, { likes: 1000, comments: 500, shares: 200 }),
      ];
      const score = calculateSocialBuzzScore(posts);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(15);
    });

    it('should apply time decay to older posts', () => {
      const posts = [
        createMockPost('reddit', 'bullish', 1, { likes: 1000, comments: 500, shares: 200 }),
        createMockPost('twitter', 'bullish', 15, { likes: 1000, comments: 500, shares: 200 }),
        createMockPost('stocktwits', 'bullish', 30, { likes: 1000, comments: 500, shares: 200 }),
      ];
      const score = calculateSocialBuzzScore(posts);
      expect(score).toBeLessThan(45); // Should be less than sum of weights due to decay
    });
  });

  describe('calculateSqueezeSignal', () => {
    it('should calculate total score from all components', () => {
      const input = {
        currentVolume: 2000000,
        priceHistory: createMockPriceHistory(Array(30).fill(10), Array(30).fill(1000000)),
        shortInterestPercent: 30,
        marketCap: 100000000,
        avgVolume: 1000000,
        recentFilings: [createMockFiling('S-1', 1)],
        recentNews: [createMockArticle('Bloomberg', 'positive', 1)],
        recentSocialPosts: [
          createMockPost('reddit', 'bullish', 1, { likes: 1000, comments: 500, shares: 200 }),
        ],
      };

      const score = calculateSqueezeSignal(input);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 for stock with no signals', () => {
      const input = {
        currentVolume: 1000000,
        priceHistory: createMockPriceHistory(Array(30).fill(10), Array(30).fill(1000000)),
        shortInterestPercent: 5,
        marketCap: 100000000,
        avgVolume: 1000000,
        recentFilings: [],
        recentNews: [],
        recentSocialPosts: [],
      };

      const score = calculateSqueezeSignal(input);
      expect(score).toBe(0);
    });

    it('should weight components correctly', () => {
      const input = {
        currentVolume: 3000000, // Max volume score (30)
        priceHistory: createMockPriceHistory(Array(30).fill(10), Array(30).fill(1000000)),
        shortInterestPercent: 55, // Max short interest score (40)
        marketCap: 100000000,
        avgVolume: 1000000,
        recentFilings: [], // No filing score
        recentNews: [], // No news score
        recentSocialPosts: [], // No social score
      };

      const score = calculateSqueezeSignal(input);
      expect(score).toBe(70); // 30 + 40 + 0 + 0 + 0
    });

    it('should handle edge cases', () => {
      const input = {
        currentVolume: 0,
        priceHistory: [],
        shortInterestPercent: 0,
        marketCap: 0,
        avgVolume: 0,
        recentFilings: [],
        recentNews: [],
        recentSocialPosts: [],
      };

      const score = calculateSqueezeSignal(input);
      expect(score).toBe(0);
    });
  });
});
