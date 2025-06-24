'use client';

import { useEffect, useState } from 'react';
import { StockCard } from './StockCard';
import { type StockFilters } from './StockFilters';
import { LoadingCard } from './ui/loading';
import { useStockFilters } from '@/lib/hooks/useStockFilters';
import { StockAnalysis } from '@/lib/types/stock';
import dynamic from 'next/dynamic';

// Lazy load DataRefreshIndicator component to reduce bundle size
const DataRefreshIndicator = dynamic(
  () => import('./DataRefreshIndicator').then((mod) => ({ default: mod.DataRefreshIndicator })),
  {
    ssr: false,
  },
);

// Lazy load ErrorMessage component to reduce bundle size
const ErrorMessage = dynamic(
  () => import('./ErrorBoundary').then((mod) => ({ default: mod.ErrorMessage })),
  {
    ssr: false,
  },
);

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

interface StockListProps {
  filters: StockFilters;
}

export function StockList({ filters }: StockListProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const { getFilteredStocks } = useStockFilters();
  const filteredStocks = getFilteredStocks(stocks);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        // Fetch stock analyses from the new API route
        const response = await fetch('/api/stocks');
        if (!response.ok) throw new Error('Failed to fetch stocks');
        const stockAnalyses: StockAnalysis[] = await response.json();

        // Transform StockAnalysis to Stock format for compatibility
        const transformedStocks: Stock[] = await Promise.all(
          stockAnalyses.map(async (analysis: StockAnalysis) => {
            let priceHistory: number[] = [];
            try {
              // Fetch last 7 days of historical prices from the new API route
              const endDate = new Date();
              const startDate = new Date();
              startDate.setDate(endDate.getDate() - 7);
              const format = (d: Date) => d.toISOString().slice(0, 10);
              const historyResp = await fetch(
                `/api/stocks/${analysis.symbol}/history?start=${format(startDate)}&end=${format(endDate)}`,
              );
              if (historyResp.ok) {
                const historyData = await historyResp.json();
                if (Array.isArray(historyData)) {
                  priceHistory = historyData.map((d: any) => d.close);
                }
              }
            } catch (e) {
              priceHistory = [];
            }
            return {
              symbol: analysis.symbol,
              name: analysis.details.name,
              price: analysis.quote.price,
              change: analysis.quote.changePercent,
              volume: analysis.quote.volume,
              marketCap: analysis.details.marketCap,
              shortInterest: analysis.shortInterestAnalysis.shortInterestPercent,
              avgVolume: analysis.volumeAnalysis.averageVolume,
              sector: analysis.details.sector,
              industry: analysis.details.industry,
              priceHistory,
              dilutionRisk: 'Medium' as const,
            };
          }),
        );
        setStocks(transformedStocks);
        setLastUpdated(Date.now());
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch stocks:', err);
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Stock List</h3>
        <DataRefreshIndicator lastUpdated={lastUpdated} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStocks.map((stock, i) => (
          <StockCard key={stock.symbol + '-' + i} stock={stock} variant="compact" />
        ))}
      </div>
    </div>
  );
}
