import { getStockQuote, getStockDetails, getHistoricalPrices } from './stockData';

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
        symbol: 'AAPL',
        price: 150.25,
        volume: 1000,
        timestamp: 1234567890,
        change: 2.5,
        changePercent: 1.5,
      });
    });

    it('should handle API errors', async () => {
      const client = require('@polygon.io/client-js').createClient();
      client.stocks.lastQuote.mockRejectedValue(new Error('API Error'));

      await expect(getStockQuote('AAPL')).rejects.toThrow('Failed to fetch quote for AAPL');
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
        symbol: 'AAPL',
        name: 'Apple Inc.',
        marketCap: 2000000000000,
        sector: 'Technology',
        industry: 'Consumer Electronics',
        shortInterest: 1000000,
        shortInterestRatio: 2.5,
      });
    });
  });

  describe('getHistoricalPrices', () => {
    it('should fetch historical price data', async () => {
      const mockHistoricalData = {
        results: [
          { timestamp: 1234567890, open: 150, high: 155, low: 148, close: 152, volume: 1000000 },
        ],
      };

      const client = require('@polygon.io/client-js').createClient();
      client.stocks.aggregates.mockResolvedValue(mockHistoricalData);

      const result = await getHistoricalPrices('AAPL', '2024-01-01', '2024-01-31');

      expect(result).toEqual(mockHistoricalData.results);
    });
  });
});
