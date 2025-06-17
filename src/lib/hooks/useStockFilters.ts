import { useCallback, useEffect, useState } from 'react';
import { type StockFilters } from '@/components/StockFilters';

const STORAGE_KEY = 'stock-filters';

const DEFAULT_FILTERS: StockFilters = {
  search: '',
  sector: 'All Sectors',
  industry: 'All Industries',
  priceRange: 'Any Price',
  marketCapRange: 'Any Market Cap',
  shortInterestRange: 'Any Short Interest',
  volumeRange: 'Any Volume',
  volumeSpikeThreshold: 1,
  dilutionRisk: 'Any Risk',
};

export function useStockFilters() {
  const [filters, setFilters] = useState<StockFilters>(() => {
    // Try to load filters from localStorage on initial render
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem(STORAGE_KEY);
      if (savedFilters) {
        try {
          return JSON.parse(savedFilters);
        } catch (e) {
          console.error('Failed to parse saved filters:', e);
        }
      }
    }
    return DEFAULT_FILTERS;
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters]);

  const handleFilterChange = useCallback((key: keyof StockFilters, value: string | number) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters, [key]: value };

      // Reset industry when sector changes
      if (key === 'sector') {
        newFilters.industry = 'All Industries';
      }

      return newFilters;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const getFilteredStocks = useCallback(
    (stocks: any[]) => {
      return stocks.filter((stock) => {
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

        // Industry filter
        if (filters.industry !== 'All Industries' && stock.industry !== filters.industry) {
          return false;
        }

        // Price range filter (penny stock universe: $1-$5)
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

        // Market cap range filter (penny stock universe: $20M-$300M)
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

        // Volume spike threshold filter
        const volumeRatio = stock.volume / stock.avgVolume;
        if (volumeRatio < filters.volumeSpikeThreshold) {
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

        // Dilution risk filter
        if (filters.dilutionRisk !== 'Any Risk' && stock.dilutionRisk !== filters.dilutionRisk) {
          return false;
        }

        return true;
      });
    },
    [filters],
  );

  return {
    filters,
    handleFilterChange,
    resetFilters,
    getFilteredStocks,
  };
}
