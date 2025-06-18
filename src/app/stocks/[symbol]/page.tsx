'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StockDetail } from '@/components/StockDetail';
import { LoadingCard } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ErrorBoundary';

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
  priceHistory: { date: string; price: number }[];
}

// Mock data for development
const mockStock: Stock = {
  symbol: 'STOCK1',
  name: 'Stock 1',
  price: 3.45,
  change: 2.5,
  volume: 1500000,
  marketCap: 500000000,
  shortInterest: 15.5,
  avgVolume: 1200000,
  sector: 'Technology',
  industry: 'Software',
  priceHistory: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      price: 3.45 * (1 + (Math.random() - 0.5) * 0.1),
    };
  }),
};

export default function StockPage() {
  const params = useParams();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  useEffect(() => {
    const fetchStock = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Mock data for development
        setStock({
          symbol: params.symbol as string,
          name: 'Example Stock',
          price: 1.23,
          change: 5.67,
          volume: 1000000,
          marketCap: 50000000,
          shortInterest: 15.5,
          avgVolume: 800000,
          sector: 'Technology',
          industry: 'Software',
          priceHistory: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            price: 1 + Math.random() * 0.5,
          })),
        });
        setLastUpdated(Date.now());
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch stock data');
        setLoading(false);
      }
    };

    fetchStock();
  }, [params.symbol]);

  if (loading) {
    return (
      <main className="container mx-auto py-6">
        <LoadingCard />
      </main>
    );
  }

  if (error || !stock) {
    return (
      <main className="container mx-auto py-6">
        <ErrorMessage message={error || 'Stock not found'} />
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6">
      <StockDetail
        symbol={stock.symbol}
        name={stock.name}
        price={stock.price}
        change={stock.change}
        volume={stock.volume}
        marketCap={stock.marketCap}
        shortInterest={stock.shortInterest}
        avgVolume={stock.avgVolume}
        sector={stock.sector}
        industry={stock.industry}
        priceHistory={stock.priceHistory}
        lastUpdated={lastUpdated}
      />
    </main>
  );
}
