'use client';

import { ArrowDown, ArrowUp, BarChart2, TrendingUp, Volume2 } from 'lucide-react';
import { StockCard } from './StockCard';
import { SparklineChart } from './SparklineChart';
import { DataRefreshIndicator } from './DataRefreshIndicator';

interface StockDetailProps {
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
  lastUpdated?: number;
}

export function StockDetail({
  symbol,
  name,
  price,
  change,
  volume,
  marketCap,
  shortInterest,
  avgVolume,
  sector,
  industry,
  priceHistory,
  lastUpdated = Date.now(),
}: StockDetailProps) {
  const isPositive = change >= 0;
  const volumeChange = ((volume - avgVolume) / avgVolume) * 100;
  const isVolumeUp = volumeChange >= 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{symbol}</h1>
          <p className="text-lg text-muted-foreground">{name}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{sector}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{industry}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">${price.toFixed(2)}</p>
          <p
            className={`flex items-center justify-end text-lg ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? (
              <ArrowUp className="mr-1 h-5 w-5" />
            ) : (
              <ArrowDown className="mr-1 h-5 w-5" />
            )}
            {Math.abs(change).toFixed(2)}%
          </p>
          <DataRefreshIndicator lastUpdated={lastUpdated} className="mt-2" />
        </div>
      </div>

      {/* Price Chart Section */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 text-lg font-semibold">Price History</h2>
        <div className="h-[300px]">
          <SparklineChart
            data={priceHistory}
            color={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
            height={300}
            width={800}
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Market Cap</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">${(marketCap / 1e9).toFixed(2)}B</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Volume</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">{volume.toLocaleString()}</p>
          <p className={`mt-1 text-sm ${isVolumeUp ? 'text-green-600' : 'text-red-600'}`}>
            {isVolumeUp ? '+' : ''}
            {volumeChange.toFixed(1)}% vs avg
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Short Interest</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">{shortInterest.toFixed(1)}%</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Avg Volume</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">{avgVolume.toLocaleString()}</p>
        </div>
      </div>

      {/* Additional Analysis Section */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 text-lg font-semibold">Analysis</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium">Volume Analysis</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Current volume is {Math.abs(volumeChange).toFixed(1)}%
              {isVolumeUp ? ' above' : ' below'} the 30-day average, indicating{' '}
              {isVolumeUp ? 'increased' : 'decreased'} trading activity.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Short Interest Analysis</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Short interest of {shortInterest.toFixed(1)}% suggests{' '}
              {shortInterest > 20
                ? 'significant bearish sentiment'
                : shortInterest > 10
                  ? 'moderate bearish sentiment'
                  : 'relatively low bearish sentiment'}
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
