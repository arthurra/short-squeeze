import {
  StockQuote,
  StockDetails,
  PriceDataPoint,
  VolumeAnalysis,
  ShortInterestAnalysis,
  StockNews,
  SECFiling,
  StockAnalysis,
  ApiResponse,
} from '../types/stock';

/**
 * Generate a random number within a range
 */
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate a random date within the last 30 days
 */
function randomRecentDate(): number {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  return Math.floor(randomInRange(thirtyDaysAgo, now));
}

/**
 * Mock stock symbols for penny stocks
 */
export const MOCK_SYMBOLS = [
  'SNDL',
  'NAKD',
  'CIDM',
  'ZOM',
  'CTRM',
  'IDEX',
  'SHIP',
  'MARK',
  'CIDM',
  'ONTX',
  'ATOS',
  'TNXP',
  'TRCH',
  'CIDM',
  'ONTX',
  'CIDM',
  'ONTX',
  'CIDM',
  'ONTX',
  'CIDM',
];

/**
 * Mock sectors and industries
 */
const SECTORS = ['Healthcare', 'Technology', 'Energy', 'Financial', 'Consumer'] as const;
type Sector = (typeof SECTORS)[number];

const INDUSTRIES: Record<Sector, string[]> = {
  Healthcare: ['Biotech', 'Pharmaceuticals', 'Medical Devices'],
  Technology: ['Software', 'Hardware', 'Semiconductors'],
  Energy: ['Oil & Gas', 'Renewable Energy', 'Utilities'],
  Financial: ['Banking', 'Insurance', 'Investment'],
  Consumer: ['Retail', 'Food & Beverage', 'Entertainment'],
};

/**
 * Generate mock stock quote
 */
export function mockStockQuote(symbol: string): StockQuote {
  const price = randomInRange(1, 5);
  const change = randomInRange(-0.5, 0.5);
  return {
    symbol,
    price,
    volume: Math.floor(randomInRange(100000, 1000000)),
    timestamp: Date.now(),
    change,
    changePercent: (change / price) * 100,
  };
}

/**
 * Generate mock stock details
 */
export function mockStockDetails(symbol: string): StockDetails {
  const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
  const industry = INDUSTRIES[sector][Math.floor(Math.random() * INDUSTRIES[sector].length)];

  return {
    symbol,
    name: `${symbol} Corporation`,
    marketCap: Math.floor(randomInRange(20000000, 300000000)),
    sector,
    industry,
    shortInterest: Math.floor(randomInRange(1000000, 10000000)),
    shortInterestRatio: randomInRange(0.1, 0.5),
  };
}

/**
 * Generate mock historical price data
 */
export function mockHistoricalPrices(symbol: string, days: number = 30): PriceDataPoint[] {
  const prices: PriceDataPoint[] = [];
  let currentPrice = randomInRange(1, 5);

  for (let i = 0; i < days; i++) {
    const change = randomInRange(-0.2, 0.2);
    currentPrice = Math.max(0.1, currentPrice + change);

    prices.push({
      timestamp: Date.now() - (days - i) * 24 * 60 * 60 * 1000,
      open: currentPrice,
      high: currentPrice + randomInRange(0, 0.5),
      low: currentPrice - randomInRange(0, 0.5),
      close: currentPrice + randomInRange(-0.2, 0.2),
      volume: Math.floor(randomInRange(100000, 1000000)),
    });
  }

  return prices;
}

/**
 * Generate mock volume analysis
 */
export function mockVolumeAnalysis(): VolumeAnalysis {
  const averageVolume = Math.floor(randomInRange(500000, 2000000));
  const currentVolume = Math.floor(randomInRange(averageVolume * 0.5, averageVolume * 3));

  return {
    averageVolume,
    currentVolume,
    volumeRatio: currentVolume / averageVolume,
    volumeSpike: currentVolume > averageVolume * 2,
  };
}

/**
 * Generate mock short interest analysis
 */
export function mockShortInterestAnalysis(): ShortInterestAnalysis {
  const shortInterest = Math.floor(randomInRange(1000000, 10000000));
  const shortInterestRatio = randomInRange(0.1, 0.5);

  return {
    shortInterest,
    shortInterestRatio,
    daysToCover: Math.floor(randomInRange(1, 10)),
    shortInterestPercent: shortInterestRatio * 100,
  };
}

/**
 * Generate mock news article
 */
export function mockNews(symbol: string): StockNews {
  return {
    id: Math.random().toString(36).substring(7),
    title: `${symbol} Stock ${Math.random() > 0.5 ? 'Surges' : 'Plummets'} on ${Math.random() > 0.5 ? 'Positive' : 'Negative'} News`,
    url: `https://example.com/news/${symbol.toLowerCase()}`,
    publishedAt: randomRecentDate(),
    source: ['Bloomberg', 'Reuters', 'CNBC', 'MarketWatch'][Math.floor(Math.random() * 4)],
    summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as
      | 'positive'
      | 'negative'
      | 'neutral',
  };
}

/**
 * Generate mock SEC filing
 */
export function mockFiling(symbol: string): SECFiling {
  return {
    id: Math.random().toString(36).substring(7),
    type: ['10-K', '10-Q', '8-K', 'S-1'][Math.floor(Math.random() * 4)],
    title: `${symbol} Files ${Math.random() > 0.5 ? 'Quarterly' : 'Annual'} Report`,
    url: `https://sec.gov/Archives/edgar/data/${symbol.toLowerCase()}`,
    filedAt: randomRecentDate(),
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  };
}

/**
 * Generate mock stock analysis
 */
export function mockStockAnalysis(symbol: string): StockAnalysis {
  const quote = mockStockQuote(symbol);
  const details = mockStockDetails(symbol);
  const volumeAnalysis = mockVolumeAnalysis();
  const shortInterestAnalysis = mockShortInterestAnalysis();

  // Calculate squeeze score based on various factors
  const squeezeScore = Math.floor(
    volumeAnalysis.volumeRatio * 30 +
      shortInterestAnalysis.shortInterestRatio * 40 +
      Math.random() * 30,
  );

  return {
    symbol,
    quote,
    details,
    volumeAnalysis,
    shortInterestAnalysis,
    recentNews: Array(3)
      .fill(null)
      .map(() => mockNews(symbol)),
    recentFilings: Array(2)
      .fill(null)
      .map(() => mockFiling(symbol)),
    squeezeScore: Math.min(100, squeezeScore),
    lastUpdated: Date.now(),
  };
}

/**
 * Generate mock API response
 */
export function mockApiResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    timestamp: Date.now(),
  };
}

/**
 * Generate a list of mock stock analyses
 */
export function mockStockList(count: number = 20): StockAnalysis[] {
  return Array(count)
    .fill(null)
    .map((_, index) => mockStockAnalysis(MOCK_SYMBOLS[index % MOCK_SYMBOLS.length]));
}
