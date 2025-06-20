'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StockDetail } from '@/components/StockDetail';
import { LoadingCard } from '@/components/ui/loading';
import { usePagePerformance } from '@/lib/hooks/usePerformance';
import { StockService } from '../../../../lib/api/stockService';
import { StockAnalysis } from '../../../lib/types/stock';

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
  priceHistory: Array<{ date: string; price: number }>;
}

export default function StockPage() {
  // Track page performance
  usePagePerformance('stock-detail');

  const params = useParams();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        const symbol = params.symbol as string;

        // Use the StockService to fetch data (mock or real based on config)
        const stockAnalysis: StockAnalysis = await StockService.getStockAnalysis(symbol);

        // Transform StockAnalysis to Stock format for compatibility
        let priceHistory: Array<{ date: string; price: number }> = [];
        try {
          // Fetch last 30 days of historical prices
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - 30);
          const format = (d: Date) => d.toISOString().slice(0, 10);
          const resp = await StockService.getHistoricalPrices(
            stockAnalysis.symbol,
            format(startDate),
            format(endDate),
          );
          if (resp.data && Array.isArray(resp.data)) {
            priceHistory = resp.data.map((d: any) => ({ date: d.date, price: d.price }));
          }
        } catch (e) {
          priceHistory = [];
        }
        const transformedStock: Stock = {
          symbol: stockAnalysis.symbol,
          name: stockAnalysis.details.name,
          price: stockAnalysis.quote.price,
          change: stockAnalysis.quote.changePercent,
          volume: stockAnalysis.quote.volume,
          marketCap: stockAnalysis.details.marketCap,
          shortInterest: stockAnalysis.shortInterestAnalysis.shortInterestPercent,
          avgVolume: stockAnalysis.volumeAnalysis.averageVolume,
          sector: stockAnalysis.details.sector,
          industry: stockAnalysis.details.industry,
          priceHistory, // Now populated
        };

        setStock(transformedStock);
        setLastUpdated(Date.now());
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch stock data:', err);
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Stock not found'}</p>
        </div>
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
