import { expect, jest, describe, it } from '@jest/globals';
import {
  ValidationError,
  validateStockQuote,
  validateStockDetails,
  validatePriceDataPoint,
  validateVolumeAnalysis,
  validateShortInterestAnalysis,
  validateStockAnalysis,
} from './validation';
import {
  mockStockQuote,
  mockStockDetails,
  mockHistoricalPrices,
  mockVolumeAnalysis,
  mockShortInterestAnalysis,
  mockStockAnalysis,
} from '../mocks/stockData';

describe('Data Validation', () => {
  describe('validateStockQuote', () => {
    it('should validate valid stock quote', () => {
      const quote = mockStockQuote('TEST');
      const validated = validateStockQuote(quote);
      expect(validated).toEqual({
        ...quote,
        price: Number(quote.price.toFixed(2)),
        change: Number(quote.change.toFixed(2)),
        changePercent: Number(quote.changePercent.toFixed(2)),
        volume: Math.floor(quote.volume),
      });
    });

    it('should throw on missing required fields', () => {
      const quote = { symbol: 'TEST' };
      expect(() => validateStockQuote(quote)).toThrow(ValidationError);
    });

    it('should throw on invalid symbol format', () => {
      const quote = { ...mockStockQuote('TEST'), symbol: 'INVALID_SYMBOL' };
      expect(() => validateStockQuote(quote)).toThrow(ValidationError);
    });

    it('should throw on negative price', () => {
      const quote = { ...mockStockQuote('TEST'), price: -1 };
      expect(() => validateStockQuote(quote)).toThrow(ValidationError);
    });
  });

  describe('validateStockDetails', () => {
    it('should validate valid stock details', () => {
      const details = mockStockDetails('TEST');
      const validated = validateStockDetails(details);
      expect(validated).toEqual({
        ...details,
        marketCap: Math.floor(details.marketCap),
        shortInterest: Math.floor(details.shortInterest),
        shortInterestRatio: Number(details.shortInterestRatio.toFixed(4)),
      });
    });

    it('should throw on missing required fields', () => {
      const details = { symbol: 'TEST' };
      expect(() => validateStockDetails(details)).toThrow(ValidationError);
    });

    it('should throw on invalid market cap', () => {
      const details = { ...mockStockDetails('TEST'), marketCap: -1 };
      expect(() => validateStockDetails(details)).toThrow(ValidationError);
    });

    it('should throw on invalid short interest ratio', () => {
      const details = { ...mockStockDetails('TEST'), shortInterestRatio: 2 };
      expect(() => validateStockDetails(details)).toThrow(ValidationError);
    });
  });

  describe('validatePriceDataPoint', () => {
    it('should validate valid price data point', () => {
      const point = mockHistoricalPrices('TEST')[0];
      const validated = validatePriceDataPoint(point);
      expect(validated).toEqual({
        ...point,
        open: Number(point.open.toFixed(2)),
        high: Number(point.high.toFixed(2)),
        low: Number(point.low.toFixed(2)),
        close: Number(point.close.toFixed(2)),
        volume: Math.floor(point.volume),
      });
    });

    it('should throw on missing required fields', () => {
      const point = { timestamp: Date.now() };
      expect(() => validatePriceDataPoint(point)).toThrow(ValidationError);
    });

    it('should throw on invalid price consistency', () => {
      const point = {
        timestamp: Date.now(),
        open: 100,
        high: 90, // Invalid: high < low
        low: 95,
        close: 98,
        volume: 1000,
      };
      expect(() => validatePriceDataPoint(point)).toThrow(ValidationError);
    });

    it('should throw on negative volume', () => {
      const point = { ...mockHistoricalPrices('TEST')[0], volume: -1 };
      expect(() => validatePriceDataPoint(point)).toThrow(ValidationError);
    });
  });

  describe('validateVolumeAnalysis', () => {
    it('should validate valid volume analysis', () => {
      const analysis = mockVolumeAnalysis();
      const validated = validateVolumeAnalysis(analysis);
      expect(validated).toEqual({
        ...analysis,
        averageVolume: Math.floor(analysis.averageVolume),
        currentVolume: Math.floor(analysis.currentVolume),
        volumeRatio: Number(analysis.volumeRatio.toFixed(2)),
      });
    });

    it('should throw on missing required fields', () => {
      const analysis = { averageVolume: 1000 };
      expect(() => validateVolumeAnalysis(analysis)).toThrow(ValidationError);
    });

    it('should throw on negative volume', () => {
      const analysis = { ...mockVolumeAnalysis(), currentVolume: -1 };
      expect(() => validateVolumeAnalysis(analysis)).toThrow(ValidationError);
    });

    it('should throw on invalid volume ratio', () => {
      const analysis = { ...mockVolumeAnalysis(), volumeRatio: -1 };
      expect(() => validateVolumeAnalysis(analysis)).toThrow(ValidationError);
    });
  });

  describe('validateShortInterestAnalysis', () => {
    it('should validate valid short interest analysis', () => {
      const analysis = mockShortInterestAnalysis();
      const validated = validateShortInterestAnalysis(analysis);
      expect(validated).toEqual({
        ...analysis,
        shortInterest: Math.floor(analysis.shortInterest),
        shortInterestRatio: Number(analysis.shortInterestRatio.toFixed(4)),
        shortInterestPercent: Number(analysis.shortInterestPercent.toFixed(2)),
      });
    });

    it('should throw on missing required fields', () => {
      const analysis = { shortInterest: 1000 };
      expect(() => validateShortInterestAnalysis(analysis)).toThrow(ValidationError);
    });

    it('should throw on invalid short interest ratio', () => {
      const analysis = { ...mockShortInterestAnalysis(), shortInterestRatio: 2 };
      expect(() => validateShortInterestAnalysis(analysis)).toThrow(ValidationError);
    });

    it('should throw on invalid short interest percent', () => {
      const analysis = { ...mockShortInterestAnalysis(), shortInterestPercent: 150 };
      expect(() => validateShortInterestAnalysis(analysis)).toThrow(ValidationError);
    });
  });

  describe('validateStockAnalysis', () => {
    it('should validate valid stock analysis', () => {
      const analysis = mockStockAnalysis('TEST');
      const validated = validateStockAnalysis(analysis);
      expect(validated).toEqual({
        ...analysis,
        quote: {
          ...analysis.quote,
          price: Number(analysis.quote.price.toFixed(2)),
          change: Number(analysis.quote.change.toFixed(2)),
          changePercent: Number(analysis.quote.changePercent.toFixed(2)),
          volume: Math.floor(analysis.quote.volume),
        },
        details: {
          ...analysis.details,
          marketCap: Math.floor(analysis.details.marketCap),
          shortInterest: Math.floor(analysis.details.shortInterest),
          shortInterestRatio: Number(analysis.details.shortInterestRatio.toFixed(4)),
        },
        volumeAnalysis: {
          ...analysis.volumeAnalysis,
          averageVolume: Math.floor(analysis.volumeAnalysis.averageVolume),
          currentVolume: Math.floor(analysis.volumeAnalysis.currentVolume),
          volumeRatio: Number(analysis.volumeAnalysis.volumeRatio.toFixed(2)),
        },
        shortInterestAnalysis: {
          ...analysis.shortInterestAnalysis,
          shortInterest: Math.floor(analysis.shortInterestAnalysis.shortInterest),
          shortInterestRatio: Number(analysis.shortInterestAnalysis.shortInterestRatio.toFixed(4)),
          shortInterestPercent: Number(
            analysis.shortInterestAnalysis.shortInterestPercent.toFixed(2),
          ),
        },
      });
    });

    it('should throw on missing required fields', () => {
      const analysis = { symbol: 'TEST' };
      expect(() => validateStockAnalysis(analysis)).toThrow(ValidationError);
    });

    it('should throw on invalid squeeze score', () => {
      const analysis = { ...mockStockAnalysis('TEST'), squeezeScore: 150 };
      expect(() => validateStockAnalysis(analysis)).toThrow(ValidationError);
    });

    it('should throw on invalid nested objects', () => {
      const analysis = {
        ...mockStockAnalysis('TEST'),
        quote: { symbol: 'TEST' }, // Invalid quote
      };
      expect(() => validateStockAnalysis(analysis)).toThrow(ValidationError);
    });
  });
});
