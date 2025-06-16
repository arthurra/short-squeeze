import React, { useState } from "react";
import { FilterPanel } from "./FilterPanel";
import { StockList } from "./StockList";
import { StockData } from "../../lib/types/stock";
import { FilterOptions } from "../../lib/types/filters";
import styles from "../../styles/Dashboard.module.css";

interface DashboardLayoutProps {
  stocks: StockData[];
  loading: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  stocks,
  loading,
}) => {
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>(stocks);

  const handleFiltersChange = (filters: FilterOptions) => {
    // TODO: Implement filtering logic
    setFilteredStocks(stocks);
  };

  return (
    <div className={styles.dashboardLayout}>
      <header className={styles.dashboardHeader}>
        <h1>Penny Stock Insights Dashboard</h1>
      </header>
      <div className={styles.dashboardContent}>
        <aside className={styles.filterSidebar}>
          <FilterPanel onFiltersChange={handleFiltersChange} />
        </aside>
        <main className={styles.mainContent}>
          {loading ? (
            <div className={styles.loadingSpinner}>Loading...</div>
          ) : (
            <StockList stocks={filteredStocks} />
          )}
        </main>
      </div>
    </div>
  );
};
