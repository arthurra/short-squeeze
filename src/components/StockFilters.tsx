'use client';

import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { useStockFilters } from '@/lib/hooks/useStockFilters';

interface StockFiltersProps {
  onFilterChange: (filters: StockFilters) => void;
}

export interface StockFilters {
  search: string;
  sector: string;
  industry: string;
  priceRange: string;
  marketCapRange: string;
  shortInterestRange: string;
  volumeRange: string;
  volumeSpikeThreshold: number;
  dilutionRisk: string;
}

const sectors = ['All Sectors', 'Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer'];

const industriesBySector = {
  'All Sectors': ['All Industries'],
  Technology: ['All Industries', 'Software', 'Hardware', 'Entertainment', 'Internet Services'],
  Healthcare: [
    'All Industries',
    'Biotechnology',
    'Medical Devices',
    'Pharmaceuticals',
    'Healthcare Services',
  ],
  Finance: ['All Industries', 'Banking', 'Insurance', 'Investment', 'Shipping'],
  Energy: ['All Industries', 'Oil & Gas', 'Renewable Energy', 'Utilities'],
  Consumer: ['All Industries', 'Retail', 'Food & Beverage', 'Apparel', 'Entertainment'],
};

const ranges = {
  price: ['Any Price', 'Under $1', '$1 - $2', '$2 - $3', '$3 - $4', '$4 - $5', 'Over $5'],
  marketCap: [
    'Any Market Cap',
    'Under $50M',
    '$50M - $100M',
    '$100M - $200M',
    '$200M - $300M',
    'Over $300M',
  ],
  shortInterest: [
    'Any Short Interest',
    'Under 10%',
    '10% - 20%',
    '20% - 30%',
    '30% - 40%',
    'Over 40%',
  ],
  volume: ['Any Volume', 'Under 100K', '100K - 500K', '500K - 1M', '1M - 5M', 'Over 5M'],
};

const dilutionRiskLevels = ['Any Risk', 'Low', 'Medium', 'High'];

export function StockFilters({ onFilterChange }: StockFiltersProps) {
  const { filters, handleFilterChange } = useStockFilters();

  return (
    <div className="space-y-6 p-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by symbol or name..."
          className="pl-9"
          value={filters.search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleFilterChange('search', e.target.value)
          }
        />
      </div>

      {/* Filters Stack */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Sector</label>
          <Select
            value={filters.sector}
            onValueChange={(value: string) => handleFilterChange('sector', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Industry</label>
          <Select
            value={filters.industry}
            onValueChange={(value: string) => handleFilterChange('industry', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Industry" />
            </SelectTrigger>
            <SelectContent>
              {industriesBySector[filters.sector as keyof typeof industriesBySector].map(
                (industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Price Range</label>
          <Select
            value={filters.priceRange}
            onValueChange={(value: string) => handleFilterChange('priceRange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              {ranges.price.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Market Cap Range</label>
          <Select
            value={filters.marketCapRange}
            onValueChange={(value: string) => handleFilterChange('marketCapRange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Market Cap Range" />
            </SelectTrigger>
            <SelectContent>
              {ranges.marketCap.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Short Interest Range</label>
          <Select
            value={filters.shortInterestRange}
            onValueChange={(value: string) => handleFilterChange('shortInterestRange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Short Interest Range" />
            </SelectTrigger>
            <SelectContent>
              {ranges.shortInterest.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Volume Range</label>
          <Select
            value={filters.volumeRange}
            onValueChange={(value: string) => handleFilterChange('volumeRange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Volume Range" />
            </SelectTrigger>
            <SelectContent>
              {ranges.volume.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Dilution Risk Level</label>
          <Select
            value={filters.dilutionRisk}
            onValueChange={(value: string) => handleFilterChange('dilutionRisk', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Risk Level" />
            </SelectTrigger>
            <SelectContent>
              {dilutionRiskLevels.map((risk) => (
                <SelectItem key={risk} value={risk}>
                  {risk}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Filter stocks based on their potential dilution risk
          </p>
        </div>

        {/* Volume Spike Threshold Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Volume Spike Threshold</label>
            <span className="text-sm text-muted-foreground">
              {filters.volumeSpikeThreshold}x average volume
            </span>
          </div>
          <Slider
            value={[filters.volumeSpikeThreshold]}
            min={1}
            max={10}
            step={0.5}
            onValueChange={(value) => handleFilterChange('volumeSpikeThreshold', value[0])}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Show stocks with volume at least {filters.volumeSpikeThreshold}x their average volume
          </p>
        </div>
      </div>
    </div>
  );
}
