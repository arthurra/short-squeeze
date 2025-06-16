'use client';

import { Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface StockFiltersProps {
  onFilterChange: (filters: StockFilters) => void;
}

export interface StockFilters {
  search: string;
  sector: string;
  priceRange: string;
  marketCapRange: string;
  shortInterestRange: string;
  volumeRange: string;
}

const sectors = ['All Sectors', 'Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer'];

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

export function StockFilters({ onFilterChange }: StockFiltersProps) {
  const [filters, setFilters] = useState<StockFilters>({
    search: '',
    sector: 'All Sectors',
    priceRange: 'Any Price',
    marketCapRange: 'Any Market Cap',
    shortInterestRange: 'Any Short Interest',
    volumeRange: 'Any Volume',
  });

  const handleFilterChange = useCallback(
    (key: keyof StockFilters, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange],
  );

  return (
    <div className="space-y-4 p-4">
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

      {/* Filter Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
    </div>
  );
}
