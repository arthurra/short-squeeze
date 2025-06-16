import {
  mockStockQuote,
  mockStockDetails,
  mockHistoricalPrices,
  mockVolumeAnalysis,
  mockShortInterestAnalysis,
  mockNews,
  mockFiling,
  mockStockAnalysis,
  mockStockList,
  MOCK_SYMBOLS,
} from './stockData';

describe('Mock Stock Data', () => {
  const testSymbol = 'TEST';

  describe('mockStockQuote', () => {
    it('should generate valid stock quote', () => {
      const quote = mockStockQuote(testSymbol);
      expect(quote.symbol).toBe(testSymbol);
      expect(quote.price).toBeGreaterThanOrEqual(1);
      expect(quote.price).toBeLessThanOrEqual(5);
      expect(quote.volume).toBeGreaterThan(0);
      expect(quote.timestamp).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('mockStockDetails', () => {
    it('should generate valid stock details', () => {
      const details = mockStockDetails(testSymbol);
      expect(details.symbol).toBe(testSymbol);
      expect(details.marketCap).toBeGreaterThanOrEqual(20000000);
      expect(details.marketCap).toBeLessThanOrEqual(300000000);
      expect(details.shortInterest).toBeGreaterThan(0);
      expect(details.shortInterestRatio).toBeGreaterThan(0);
      expect(details.shortInterestRatio).toBeLessThan(1);
    });
  });

  describe('mockHistoricalPrices', () => {
    it('should generate correct number of price points', () => {
      const prices = mockHistoricalPrices(testSymbol, 10);
      expect(prices).toHaveLength(10);
    });

    it('should generate valid price data', () => {
      const prices = mockHistoricalPrices(testSymbol);
      prices.forEach((price) => {
        expect(price.high).toBeGreaterThanOrEqual(price.low);
        expect(price.open).toBeGreaterThan(0);
        expect(price.close).toBeGreaterThan(0);
        expect(price.volume).toBeGreaterThan(0);
      });
    });
  });

  describe('mockVolumeAnalysis', () => {
    it('should generate valid volume analysis', () => {
      const analysis = mockVolumeAnalysis();
      expect(analysis.averageVolume).toBeGreaterThan(0);
      expect(analysis.currentVolume).toBeGreaterThan(0);
      expect(analysis.volumeRatio).toBeGreaterThan(0);
      expect(typeof analysis.volumeSpike).toBe('boolean');
    });
  });

  describe('mockShortInterestAnalysis', () => {
    it('should generate valid short interest analysis', () => {
      const analysis = mockShortInterestAnalysis();
      expect(analysis.shortInterest).toBeGreaterThan(0);
      expect(analysis.shortInterestRatio).toBeGreaterThan(0);
      expect(analysis.shortInterestRatio).toBeLessThan(1);
      expect(analysis.daysToCover).toBeGreaterThan(0);
      expect(analysis.shortInterestPercent).toBeGreaterThan(0);
    });
  });

  describe('mockNews', () => {
    it('should generate valid news article', () => {
      const news = mockNews(testSymbol);
      expect(news.id).toBeDefined();
      expect(news.title).toContain(testSymbol);
      expect(news.url).toContain(testSymbol.toLowerCase());
      expect(news.publishedAt).toBeLessThanOrEqual(Date.now());
      expect(news.source).toBeDefined();
      expect(news.summary).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(news.sentiment);
    });
  });

  describe('mockFiling', () => {
    it('should generate valid SEC filing', () => {
      const filing = mockFiling(testSymbol);
      expect(filing.id).toBeDefined();
      expect(['10-K', '10-Q', '8-K', 'S-1']).toContain(filing.type);
      expect(filing.title).toContain(testSymbol);
      expect(filing.url).toContain(testSymbol.toLowerCase());
      expect(filing.filedAt).toBeLessThanOrEqual(Date.now());
      expect(filing.description).toBeDefined();
    });
  });

  describe('mockStockAnalysis', () => {
    it('should generate valid stock analysis', () => {
      const analysis = mockStockAnalysis(testSymbol);
      expect(analysis.symbol).toBe(testSymbol);
      expect(analysis.quote.symbol).toBe(testSymbol);
      expect(analysis.details.symbol).toBe(testSymbol);
      expect(analysis.recentNews).toHaveLength(3);
      expect(analysis.recentFilings).toHaveLength(2);
      expect(analysis.squeezeScore).toBeGreaterThanOrEqual(0);
      expect(analysis.squeezeScore).toBeLessThanOrEqual(100);
    });
  });

  describe('mockStockList', () => {
    it('should generate correct number of stocks', () => {
      const count = 5;
      const stocks = mockStockList(count);
      expect(stocks).toHaveLength(count);
    });

    it('should use mock symbols', () => {
      const stocks = mockStockList(10);
      stocks.forEach((stock) => {
        expect(MOCK_SYMBOLS).toContain(stock.symbol);
      });
    });
  });
});
