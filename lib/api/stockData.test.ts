import { expect, jest, describe, it, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import { getStockQuote, getStockDetails, getHistoricalPrices } from './stockData';
import { ApiError } from '../types/stock';

// Mock the Polygon.io client
jest.mock('@polygon.io/client-js', () => ({
  createClient: () => ({
    stocks: {
      lastQuote: jest.fn(),
      aggregates: jest.fn(),
    },
    reference: {
      tickerDetails: jest.fn(),
      shortInterest: jest.fn(),
    },
  }),
}));

describe('Stock Data API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStockQuote', () => {
    it('should fetch and transform stock quote data', async () => {
      const mockQuote = {
        symbol: 'AAPL',
        lastPrice: 150.25,
        lastSize: 1000,
        timestamp: 1234567890,
        change: 2.5,
        changePercent: 1.5,
      };

      const client = require('@polygon.io/client-js').createClient();
      client.stocks.lastQuote.mockResolvedValue(mockQuote);

      const result = await getStockQuote('AAPL');

      expect(result).toEqual({
        data: {
          symbol: 'AAPL',
          price: 150.25,
          volume: 1000,
          timestamp: 1234567890,
          change: 2.5,
          changePercent: 1.5,
        },
        timestamp: expect.any(Number),
      });
    });

    it('should handle API errors', async () => {
      const client = require('@polygon.io/client-js').createClient();
      client.stocks.lastQuote.mockRejectedValue(new Error('API Error'));

      await expect(getStockQuote('AAPL')).rejects.toMatchObject({
        code: 'QUOTE_FETCH_ERROR',
        message: 'Failed to fetch quote for AAPL',
      });
    });
  });

  describe('getStockDetails', () => {
    it('should fetch and transform stock details', async () => {
      const mockTickerDetails = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        marketCap: 2000000000000,
        sector: 'Technology',
        industry: 'Consumer Electronics',
      };

      const mockShortInterest = {
        shortInterest: 1000000,
        shortInterestRatio: 2.5,
      };

      const client = require('@polygon.io/client-js').createClient();
      client.reference.tickerDetails.mockResolvedValue(mockTickerDetails);
      client.reference.shortInterest.mockResolvedValue(mockShortInterest);

      const result = await getStockDetails('AAPL');

      expect(result).toEqual({
        data: {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          marketCap: 2000000000000,
          sector: 'Technology',
          industry: 'Consumer Electronics',
          shortInterest: 1000000,
          shortInterestRatio: 2.5,
        },
        timestamp: expect.any(Number),
      });
    });

    it('should handle API errors', async () => {
      const client = require('@polygon.io/client-js').createClient();
      client.reference.tickerDetails.mockRejectedValue(new Error('API Error'));

      await expect(getStockDetails('AAPL')).rejects.toMatchObject({
        code: 'DETAILS_FETCH_ERROR',
        message: 'Failed to fetch details for AAPL',
      });
    });
  });

  describe('getHistoricalPrices', () => {
    it('should fetch historical price data', async () => {
      const mockHistoricalData = {
        results: [{ t: 1234567890, o: 150, h: 155, l: 148, c: 152, v: 1000000 }],
      };

      const client = require('@polygon.io/client-js').createClient();
      client.stocks.aggregates.mockResolvedValue(mockHistoricalData);

      const result = await getHistoricalPrices('AAPL', '2024-01-01', '2024-01-31');

      expect(result).toEqual({
        data: [
          {
            timestamp: 1234567890,
            open: 150,
            high: 155,
            low: 148,
            close: 152,
            volume: 1000000,
          },
        ],
        timestamp: expect.any(Number),
      });
    });

    it('should handle API errors', async () => {
      const client = require('@polygon.io/client-js').createClient();
      client.stocks.aggregates.mockRejectedValue(new Error('API Error'));

      await expect(getHistoricalPrices('AAPL', '2024-01-01', '2024-01-31')).rejects.toMatchObject({
        code: 'HISTORICAL_FETCH_ERROR',
        message: 'Failed to fetch historical prices for AAPL',
      });
    });
  });
});
