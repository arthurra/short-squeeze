import { USExchange } from "../utils/exchangeUtils";

export interface HistoricalDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ShortInterestData {
  shortInterest: number; // Number of shares sold short
  shortInterestRatio: number; // Days to cover (short interest / average daily volume)
  shortInterestPercent: number; // Percentage of float sold short
  lastUpdated: Date;
}

export interface TradingFlowData {
  buyVolume: number; // Total buy volume
  sellVolume: number; // Total sell volume
  netFlow: number; // Net trading flow (buy - sell)
  largeTransactions: number; // Number of transactions > $100k
  blockTransactions: number; // Number of transactions > $500k
  lastUpdated: Date;
}

export interface SECFiling {
  type: string;
  date: Date;
  description: string;
  url: string;
  isRecent: boolean;
}

export interface NewsReport {
  title: string;
  source: string;
  url: string;
  publishedAt: Date;
  sentiment: "positive" | "negative" | "neutral";
  relevance: number; // 0-1 scale indicating relevance to squeeze potential
  isRecent: boolean;
}

export interface SocialMediaPost {
  platform: "reddit" | "twitter" | "stocktwits";
  content: string;
  author: string;
  url: string;
  postedAt: Date;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  sentiment: "positive" | "negative" | "neutral";
  relevance: number; // 0-1 scale indicating relevance to squeeze potential
  isRecent: boolean;
}

export interface SocialMediaMetrics {
  totalPosts: number;
  recentPosts: number;
  totalEngagement: number;
  recentEngagement: number;
  averageSentiment: number;
  averageRelevance: number;
  platformBreakdown: {
    reddit: number;
    twitter: number;
    stocktwits: number;
  };
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  exchange: string;
  lastUpdated: Date;
  historicalData?: HistoricalDataPoint[];
  shortInterest?: ShortInterestData;
  tradingFlow?: TradingFlowData;
  secFilings?: SECFiling[];
  newsReports?: NewsReport[];
  socialMedia?: {
    posts: SocialMediaPost[];
    metrics: SocialMediaMetrics;
  };
}

export interface StockUniverse {
  stocks: StockData[];
  lastUpdated: Date;
}
