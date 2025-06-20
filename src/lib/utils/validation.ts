import {
  StockQuote,
  StockDetails,
  PriceDataPoint,
  VolumeAnalysis,
  ShortInterestAnalysis,
  StockNews,
  SECFiling,
  StockAnalysis,
} from '../types/stock';

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates and sanitizes a stock quote
 */
export function validateStockQuote(quote: unknown): StockQuote {
  if (!quote || typeof quote !== 'object') {
    throw new ValidationError('Invalid stock quote data');
  }

  const data = quote as Record<string, unknown>;

  // Required fields
  const requiredFields = ['symbol', 'price', 'volume', 'timestamp', 'change', 'changePercent'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new ValidationError(`Missing required field: ${field}`, field);
    }
  }

  // Type validation
  if (typeof data.symbol !== 'string' || !data.symbol.match(/^[A-Z]{1,5}$/)) {
    throw new ValidationError('Invalid symbol format', 'symbol');
  }

  if (typeof data.price !== 'number' || data.price <= 0) {
    throw new ValidationError('Price must be a positive number', 'price');
  }

  if (typeof data.volume !== 'number' || data.volume < 0) {
    throw new ValidationError('Volume must be a non-negative number', 'volume');
  }

  if (typeof data.timestamp !== 'number' || data.timestamp <= 0) {
    throw new ValidationError('Invalid timestamp', 'timestamp');
  }

  if (typeof data.change !== 'number') {
    throw new ValidationError('Change must be a number', 'change');
  }

  if (typeof data.changePercent !== 'number') {
    throw new ValidationError('Change percent must be a number', 'changePercent');
  }

  return {
    symbol: data.symbol,
    price: Number(data.price.toFixed(2)),
    volume: Math.floor(data.volume),
    timestamp: data.timestamp,
    change: Number(data.change.toFixed(2)),
    changePercent: Number(data.changePercent.toFixed(2)),
  };
}

/**
 * Validates and sanitizes stock details
 */
export function validateStockDetails(details: unknown): StockDetails {
  if (!details || typeof details !== 'object') {
    throw new ValidationError('Invalid stock details data');
  }

  const data = details as Record<string, unknown>;

  // Required fields
  const requiredFields = [
    'symbol',
    'name',
    'marketCap',
    'sector',
    'industry',
    'shortInterest',
    'shortInterestRatio',
  ];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new ValidationError(`Missing required field: ${field}`, field);
    }
  }

  // Type validation
  if (typeof data.symbol !== 'string' || !data.symbol.match(/^[A-Z]{1,5}$/)) {
    throw new ValidationError('Invalid symbol format', 'symbol');
  }

  if (typeof data.name !== 'string' || data.name.length === 0) {
    throw new ValidationError('Name must be a non-empty string', 'name');
  }

  if (typeof data.marketCap !== 'number' || data.marketCap < 0) {
    throw new ValidationError('Market cap must be a non-negative number', 'marketCap');
  }

  if (typeof data.sector !== 'string' || data.sector.length === 0) {
    throw new ValidationError('Sector must be a non-empty string', 'sector');
  }

  if (typeof data.industry !== 'string' || data.industry.length === 0) {
    throw new ValidationError('Industry must be a non-empty string', 'industry');
  }

  if (typeof data.shortInterest !== 'number' || data.shortInterest < 0) {
    throw new ValidationError('Short interest must be a non-negative number', 'shortInterest');
  }

  if (
    typeof data.shortInterestRatio !== 'number' ||
    data.shortInterestRatio < 0 ||
    data.shortInterestRatio > 1
  ) {
    throw new ValidationError('Short interest ratio must be between 0 and 1', 'shortInterestRatio');
  }

  return {
    symbol: data.symbol,
    name: data.name.trim(),
    marketCap: Math.floor(data.marketCap),
    sector: data.sector.trim(),
    industry: data.industry.trim(),
    shortInterest: Math.floor(data.shortInterest),
    shortInterestRatio: Number(data.shortInterestRatio.toFixed(4)),
  };
}

/**
 * Validates and sanitizes a price data point
 */
export function validatePriceDataPoint(point: unknown): PriceDataPoint {
  if (!point || typeof point !== 'object') {
    throw new ValidationError('Invalid price data point');
  }

  const data = point as Record<string, unknown>;

  // Required fields
  const requiredFields = ['timestamp', 'open', 'high', 'low', 'close', 'volume'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new ValidationError(`Missing required field: ${field}`, field);
    }
  }

  // Type validation
  if (typeof data.timestamp !== 'number' || data.timestamp <= 0) {
    throw new ValidationError('Invalid timestamp', 'timestamp');
  }

  const priceFields = ['open', 'high', 'low', 'close'];
  for (const field of priceFields) {
    if (typeof data[field] !== 'number' || data[field] <= 0) {
      throw new ValidationError(`${field} must be a positive number`, field);
    }
  }

  if (typeof data.volume !== 'number' || data.volume < 0) {
    throw new ValidationError('Volume must be a non-negative number', 'volume');
  }

  // Price consistency validation
  const high = data.high as number;
  const low = data.low as number;
  const open = data.open as number;
  const close = data.close as number;

  if (high < low) {
    throw new ValidationError('High price cannot be less than low price');
  }

  if (open < low || open > high) {
    throw new ValidationError('Open price must be between low and high');
  }

  if (close < low || close > high) {
    throw new ValidationError('Close price must be between low and high');
  }

  return {
    timestamp: data.timestamp,
    open: Number(open.toFixed(2)),
    high: Number(high.toFixed(2)),
    low: Number(low.toFixed(2)),
    close: Number(close.toFixed(2)),
    volume: Math.floor(data.volume),
  };
}

/**
 * Validates and sanitizes volume analysis
 */
export function validateVolumeAnalysis(analysis: unknown): VolumeAnalysis {
  if (!analysis || typeof analysis !== 'object') {
    throw new ValidationError('Invalid volume analysis data');
  }

  const data = analysis as Record<string, unknown>;

  // Required fields
  const requiredFields = ['averageVolume', 'currentVolume', 'volumeRatio', 'volumeSpike'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new ValidationError(`Missing required field: ${field}`, field);
    }
  }

  // Type validation
  if (typeof data.averageVolume !== 'number' || data.averageVolume < 0) {
    throw new ValidationError('Average volume must be a non-negative number', 'averageVolume');
  }

  if (typeof data.currentVolume !== 'number' || data.currentVolume < 0) {
    throw new ValidationError('Current volume must be a non-negative number', 'currentVolume');
  }

  if (typeof data.volumeRatio !== 'number' || data.volumeRatio < 0) {
    throw new ValidationError('Volume ratio must be a non-negative number', 'volumeRatio');
  }

  if (typeof data.volumeSpike !== 'boolean') {
    throw new ValidationError('Volume spike must be a boolean', 'volumeSpike');
  }

  return {
    averageVolume: Math.floor(data.averageVolume),
    currentVolume: Math.floor(data.currentVolume),
    volumeRatio: Number(data.volumeRatio.toFixed(2)),
    volumeSpike: data.volumeSpike,
  };
}

/**
 * Validates and sanitizes short interest analysis
 */
export function validateShortInterestAnalysis(analysis: unknown): ShortInterestAnalysis {
  if (!analysis || typeof analysis !== 'object') {
    throw new ValidationError('Invalid short interest analysis data');
  }

  const data = analysis as Record<string, unknown>;

  // Required fields
  const requiredFields = [
    'shortInterest',
    'shortInterestRatio',
    'daysToCover',
    'shortInterestPercent',
  ];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new ValidationError(`Missing required field: ${field}`, field);
    }
  }

  // Type validation
  if (typeof data.shortInterest !== 'number' || data.shortInterest < 0) {
    throw new ValidationError('Short interest must be a non-negative number', 'shortInterest');
  }

  if (
    typeof data.shortInterestRatio !== 'number' ||
    data.shortInterestRatio < 0 ||
    data.shortInterestRatio > 1
  ) {
    throw new ValidationError('Short interest ratio must be between 0 and 1', 'shortInterestRatio');
  }

  if (typeof data.daysToCover !== 'number' || data.daysToCover < 0) {
    throw new ValidationError('Days to cover must be a non-negative number', 'daysToCover');
  }

  if (
    typeof data.shortInterestPercent !== 'number' ||
    data.shortInterestPercent < 0 ||
    data.shortInterestPercent > 100
  ) {
    throw new ValidationError(
      'Short interest percent must be between 0 and 100',
      'shortInterestPercent',
    );
  }

  return {
    shortInterest: Math.floor(data.shortInterest),
    shortInterestRatio: Number(data.shortInterestRatio.toFixed(4)),
    daysToCover: Math.ceil(data.daysToCover),
    shortInterestPercent: Number(data.shortInterestPercent.toFixed(2)),
  };
}

/**
 * Validates and sanitizes a stock analysis
 */
export function validateStockAnalysis(analysis: unknown): StockAnalysis {
  if (!analysis || typeof analysis !== 'object') {
    throw new ValidationError('Invalid stock analysis data');
  }

  const data = analysis as Record<string, unknown>;

  // Required fields
  const requiredFields = [
    'symbol',
    'quote',
    'details',
    'volumeAnalysis',
    'shortInterestAnalysis',
    'recentNews',
    'recentFilings',
    'squeezeScore',
    'lastUpdated',
  ];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new ValidationError(`Missing required field: ${field}`, field);
    }
  }

  // Validate nested objects
  const quote = validateStockQuote(data.quote);
  const details = validateStockDetails(data.details);
  const volumeAnalysis = validateVolumeAnalysis(data.volumeAnalysis);
  const shortInterestAnalysis = validateShortInterestAnalysis(data.shortInterestAnalysis);

  // Validate arrays
  if (!Array.isArray(data.recentNews)) {
    throw new ValidationError('Recent news must be an array', 'recentNews');
  }

  if (!Array.isArray(data.recentFilings)) {
    throw new ValidationError('Recent filings must be an array', 'recentFilings');
  }

  // Validate squeeze score
  if (typeof data.squeezeScore !== 'number' || data.squeezeScore < 0 || data.squeezeScore > 100) {
    throw new ValidationError('Squeeze score must be between 0 and 100', 'squeezeScore');
  }

  // Validate last updated timestamp
  if (typeof data.lastUpdated !== 'number' || data.lastUpdated <= 0) {
    throw new ValidationError('Invalid last updated timestamp', 'lastUpdated');
  }

  return {
    symbol: data.symbol as string,
    quote,
    details,
    volumeAnalysis,
    shortInterestAnalysis,
    recentNews: data.recentNews as StockNews[],
    recentFilings: data.recentFilings as SECFiling[],
    squeezeScore: Math.floor(data.squeezeScore),
    lastUpdated: data.lastUpdated,
  };
}
