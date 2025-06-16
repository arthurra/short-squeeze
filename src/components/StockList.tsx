'use client';

import { useCallback, useEffect, useState } from 'react';
import { StockCard } from './StockCard';
import { StockFilters, type StockFilters as StockFiltersType } from './StockFilters';
import { LoadingCard } from './ui/loading';
import { ErrorMessage } from './ErrorBoundary';

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
}

// Real penny stocks data for development
const pennyStocks = [
  {
    symbol: 'SNDL',
    name: 'Sundial Growers Inc.',
    sector: 'Healthcare',
    industry: 'Biotechnology',
  },
  {
    symbol: 'CIDM',
    name: 'Cinedigm Corp.',
    sector: 'Technology',
    industry: 'Entertainment',
  },
  {
    symbol: 'NAKD',
    name: 'Naked Brand Group Ltd.',
    sector: 'Consumer',
    industry: 'Retail',
  },
  {
    symbol: 'ZOM',
    name: 'Zomedica Corp.',
    sector: 'Healthcare',
    industry: 'Biotechnology',
  },
  {
    symbol: 'CTRM',
    name: 'Castor Maritime Inc.',
    sector: 'Finance',
    industry: 'Shipping',
  },
  {
    symbol: 'IDEX',
    name: 'Ideanomics Inc.',
    sector: 'Technology',
    industry: 'Software',
  },
  {
    symbol: 'CIDM',
    name: 'Cinedigm Corp.',
    sector: 'Technology',
    industry: 'Entertainment',
  },
  {
    symbol: 'CIDM',
    name: 'Cinedigm Corp.',
    sector: 'Technology',
    industry: 'Entertainment',
  },
  {
    symbol: 'CIDM',
    name: 'Cinedigm Corp.',
    sector: 'Technology',
    industry: 'Entertainment',
  },
  {
    symbol: 'CIDM',
    name: 'Cinedigm Corp.',
    sector: 'Technology',
    industry: 'Entertainment',
  },
];

// Mock data for development
const mockStocks: Stock[] = Array.from({ length: 1000 }, (_, i) => {
  const baseStock = pennyStocks[i % pennyStocks.length];
  const basePrice = Math.random() * 5;
  const priceHistory = Array.from(
    { length: 30 },
    () => basePrice * (1 + (Math.random() - 0.5) * 0.1),
  );

  return {
    symbol: baseStock.symbol,
    name: baseStock.name,
    price: basePrice,
    change: (Math.random() - 0.5) * 10,
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(Math.random() * 300000000),
    shortInterest: Math.random() * 50,
    avgVolume: Math.floor(Math.random() * 5000000),
    sector: baseStock.sector,
    industry: baseStock.industry,
    priceHistory,
  };
});

export function StockList() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStocks(mockStocks);
        setFilteredStocks(mockStocks);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch stocks');
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  const handleFilterChange = useCallback(
    (filters: StockFiltersType) => {
      const filtered = stocks.filter((stock) => {
        // Search filter
        if (
          filters.search &&
          !stock.symbol.toLowerCase().includes(filters.search.toLowerCase()) &&
          !stock.name.toLowerCase().includes(filters.search.toLowerCase())
        ) {
          return false;
        }

        // Sector filter
        if (filters.sector !== 'All Sectors' && stock.sector !== filters.sector) {
          return false;
        }

        // Price range filter
        const priceRanges = {
          'Under $1': (price: number) => price < 1,
          '$1 - $2': (price: number) => price >= 1 && price <= 2,
          '$2 - $3': (price: number) => price > 2 && price <= 3,
          '$3 - $4': (price: number) => price > 3 && price <= 4,
          '$4 - $5': (price: number) => price > 4 && price <= 5,
          'Over $5': (price: number) => price > 5,
        };
        if (
          filters.priceRange !== 'Any Price' &&
          !priceRanges[filters.priceRange as keyof typeof priceRanges]?.(stock.price)
        ) {
          return false;
        }

        // Market cap range filter
        const marketCapRanges = {
          'Under $50M': (cap: number) => cap < 50000000,
          '$50M - $100M': (cap: number) => cap >= 50000000 && cap <= 100000000,
          '$100M - $200M': (cap: number) => cap > 100000000 && cap <= 200000000,
          '$200M - $300M': (cap: number) => cap > 200000000 && cap <= 300000000,
          'Over $300M': (cap: number) => cap > 300000000,
        };
        if (
          filters.marketCapRange !== 'Any Market Cap' &&
          !marketCapRanges[filters.marketCapRange as keyof typeof marketCapRanges]?.(
            stock.marketCap,
          )
        ) {
          return false;
        }

        // Short interest range filter
        const shortInterestRanges = {
          'Under 10%': (si: number) => si < 10,
          '10% - 20%': (si: number) => si >= 10 && si <= 20,
          '20% - 30%': (si: number) => si > 20 && si <= 30,
          '30% - 40%': (si: number) => si > 30 && si <= 40,
          'Over 40%': (si: number) => si > 40,
        };
        if (
          filters.shortInterestRange !== 'Any Short Interest' &&
          !shortInterestRanges[filters.shortInterestRange as keyof typeof shortInterestRanges]?.(
            stock.shortInterest,
          )
        ) {
          return false;
        }

        // Volume range filter
        const volumeRanges = {
          'Under 100K': (vol: number) => vol < 100000,
          '100K - 500K': (vol: number) => vol >= 100000 && vol <= 500000,
          '500K - 1M': (vol: number) => vol > 500000 && vol <= 1000000,
          '1M - 5M': (vol: number) => vol > 1000000 && vol <= 5000000,
          'Over 5M': (vol: number) => vol > 5000000,
        };
        if (
          filters.volumeRange !== 'Any Volume' &&
          !volumeRanges[filters.volumeRange as keyof typeof volumeRanges]?.(stock.volume)
        ) {
          return false;
        }

        return true;
      });

      setFilteredStocks(filtered);
    },
    [stocks],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <StockFilters onFilterChange={handleFilterChange} />
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
        <StockFilters onFilterChange={handleFilterChange} />
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StockFilters onFilterChange={handleFilterChange} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStocks.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} variant="compact" />
        ))}
      </div>
    </div>
  );
}
