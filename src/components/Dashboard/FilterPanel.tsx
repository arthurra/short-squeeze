import React, { useState } from "react";
import { FilterOptions } from "../../lib/types/filters";
import styles from "../../styles/Dashboard.module.css";

interface FilterPanelProps {
  onFiltersChange: (filters: FilterOptions) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onFiltersChange,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: undefined,
    maxPrice: undefined,
    minVolume: undefined,
    minMarketCap: undefined,
    exchanges: [],
    searchTerm: "",
  });

  const handlePriceChange = (
    min: number | undefined,
    max: number | undefined
  ) => {
    const newFilters = { ...filters, minPrice: min, maxPrice: max };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleVolumeChange = (min: number | undefined) => {
    const newFilters = { ...filters, minVolume: min };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleMarketCapChange = (min: number | undefined) => {
    const newFilters = { ...filters, minMarketCap: min };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleExchangeToggle = (exchange: string) => {
    const exchanges = filters.exchanges || [];
    const newExchanges = exchanges.includes(exchange)
      ? exchanges.filter((e) => e !== exchange)
      : [...exchanges, exchange];
    const newFilters = { ...filters, exchanges: newExchanges };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (term: string) => {
    const newFilters = { ...filters, searchTerm: term };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const newFilters: FilterOptions = {
      minPrice: undefined,
      maxPrice: undefined,
      minVolume: undefined,
      minMarketCap: undefined,
      exchanges: [],
      searchTerm: "",
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterSection}>
        <h3>Price Range</h3>
        <div className={styles.filterInputs}>
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice || ""}
            onChange={(e) =>
              handlePriceChange(
                e.target.value ? Number(e.target.value) : undefined,
                filters.maxPrice
              )
            }
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice || ""}
            onChange={(e) =>
              handlePriceChange(
                filters.minPrice,
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          />
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3>Volume</h3>
        <div className={styles.filterInputs}>
          <input
            type="number"
            placeholder="Min Volume"
            value={filters.minVolume || ""}
            onChange={(e) =>
              handleVolumeChange(
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          />
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3>Market Cap</h3>
        <div className={styles.filterInputs}>
          <input
            type="number"
            placeholder="Min Market Cap"
            value={filters.minMarketCap || ""}
            onChange={(e) =>
              handleMarketCapChange(
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          />
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3>Exchanges</h3>
        <div className={styles.exchangeButtons}>
          {["NYSE", "NASDAQ", "AMEX"].map((exchange) => (
            <button
              key={exchange}
              className={`${styles.exchangeButton} ${
                filters.exchanges?.includes(exchange) ? styles.active : ""
              }`}
              onClick={() => handleExchangeToggle(exchange)}
            >
              {exchange}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3>Search</h3>
        <div className={styles.filterInputs}>
          <input
            type="text"
            placeholder="Search by symbol or name"
            value={filters.searchTerm || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      <button className={styles.resetButton} onClick={handleReset}>
        Reset Filters
      </button>
    </div>
  );
};
