'use client';

import { useEffect, useState } from 'react';
import { StockCard } from './StockCard';
import { type StockFilters } from './StockFilters';
import { LoadingCard } from './ui/loading';
import { ErrorMessage } from './ErrorBoundary';
import { useStockFilters } from '@/lib/hooks/useStockFilters';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  shortInterest: number;
  avgVolume: number;
  sector: string;
  industry: string;
  priceHistory: number[];
  dilutionRisk: 'Low' | 'Medium' | 'High';
}

// Real penny stocks data for development
const pennyStocks = [
  { symbol: 'SNDL', name: 'Sundial Growers Inc.', sector: 'Healthcare', industry: 'Biotechnology' },
  { symbol: 'CIDM', name: 'Cinedigm Corp.', sector: 'Technology', industry: 'Entertainment' },
  { symbol: 'NAKD', name: 'Naked Brand Group Ltd.', sector: 'Consumer', industry: 'Retail' },
  { symbol: 'ZOM', name: 'Zomedica Corp.', sector: 'Healthcare', industry: 'Biotechnology' },
  { symbol: 'CTRM', name: 'Castor Maritime Inc.', sector: 'Finance', industry: 'Shipping' },
  { symbol: 'IDEX', name: 'Ideanomics Inc.', sector: 'Technology', industry: 'Software' },
  {
    symbol: 'SENS',
    name: 'Senseonics Holdings Inc.',
    sector: 'Healthcare',
    industry: 'Medical Devices',
  },
  { symbol: 'MARK', name: 'Remark Holdings Inc.', sector: 'Technology', industry: 'Software' },
  { symbol: 'OGEN', name: 'Oragenics Inc.', sector: 'Healthcare', industry: 'Biotechnology' },
  { symbol: 'TRCH', name: 'Torchlight Energy Resources', sector: 'Energy', industry: 'Oil & Gas' },
];

// Mock data for development
const mockStocks: Stock[] = Array.from({ length: 1000 }, (_, i) => {
  const baseStock = pennyStocks[i % pennyStocks.length];
  const basePrice = 1 + Math.random() * 4; // Price between $1 and $5
  const priceChange = (Math.random() - 0.5) * 0.1; // Random price change between -5% and +5%
  const currentPrice = basePrice * (1 + priceChange);

  // Generate 30 days of price history
  const priceHistory = Array.from({ length: 30 }, (_, day) => {
    const dailyChange = (Math.random() - 0.5) * 0.02; // Random daily change between -1% and +1%
    return basePrice * (1 + dailyChange);
  });

  // Generate dilution risk based on market cap and recent price movement
  const dilutionRisk = (() => {
    const riskScore = Math.random();
    if (riskScore < 0.3) return 'Low';
    if (riskScore < 0.7) return 'Medium';
    return 'High';
  })();

  return {
    symbol: baseStock.symbol,
    name: baseStock.name,
    price: currentPrice,
    change: priceChange * 100,
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(20000000 + Math.random() * 280000000), // Market cap between $20M and $300M
    shortInterest: Math.random() * 50,
    avgVolume: Math.floor(Math.random() * 5000000),
    sector: baseStock.sector,
    industry: baseStock.industry,
    priceHistory: priceHistory,
    dilutionRisk,
  };
});

interface StockListProps {
  filters: StockFilters;
}

export function StockList({ filters }: StockListProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getFilteredStocks } = useStockFilters();
  const filteredStocks = getFilteredStocks(stocks);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStocks(mockStocks);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch stocks');
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStocks.map((stock, i) => (
          <StockCard key={stock.symbol + '-' + i} stock={stock} variant="compact" />
        ))}
      </div>
    </div>
  );
}
