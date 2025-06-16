'use client';

import { ArrowDown, ArrowUp, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SparklineChart } from './SparklineChart';

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

interface StockCardProps {
  stock: Stock;
  variant?: 'compact' | 'detailed';
}

export function StockCard({ stock, variant = 'compact' }: StockCardProps) {
  const router = useRouter();
  const isPositive = stock.change >= 0;
  const volumeChange = ((stock.volume - stock.avgVolume) / stock.avgVolume) * 100;
  const isVolumePositive = volumeChange >= 0;

  const handleClick = () => {
    router.push(`/stocks/${stock.symbol}`);
  };

  return (
    <div
      className="flex h-full cursor-pointer flex-col rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{stock.symbol}</h3>
          <p className="text-sm text-muted-foreground">{stock.name}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">${stock.price.toFixed(2)}</p>
          <p
            className={`flex items-center justify-end text-sm ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? (
              <ArrowUp className="mr-1 h-4 w-4" />
            ) : (
              <ArrowDown className="mr-1 h-4 w-4" />
            )}
            {Math.abs(stock.change).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Vol: {stock.volume.toLocaleString()}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          MCap: ${(stock.marketCap / 1000000).toFixed(1)}M
        </div>
      </div>

      {variant === 'detailed' && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Short Interest</p>
              <p className="font-semibold">{stock.shortInterest.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Volume</p>
              <p className="font-semibold">{stock.avgVolume.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Sector</p>
            <p className="font-semibold">{stock.sector}</p>
          </div>

          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Industry</p>
            <p className="font-semibold">{stock.industry}</p>
          </div>
        </>
      )}

      <div className="mt-auto h-16">
        <SparklineChart data={stock.priceHistory} />
      </div>
    </div>
  );
}
