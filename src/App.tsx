import React, { useState, useEffect } from "react";
import { DashboardLayout } from "./components/Dashboard/DashboardLayout";
import { StockDataService } from "./services/stockDataService";
import { StockData } from "./lib/types/stock";
import { FilterOptions } from "./lib/types/filters";
import styles from "./styles/App.module.css";

function App() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const stockDataService = StockDataService.getInstance();

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const stockUniverse = await stockDataService.getStockUniverse();
        setStocks(stockUniverse);
      } catch (error) {
        console.error("Error loading stocks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStocks();
  }, []);

  const handleFiltersChange = async (filters: FilterOptions) => {
    try {
      const filteredStocks = await stockDataService.getFilteredStocks(filters);
      setStocks(filteredStocks);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  return (
    <div className={styles.app}>
      <DashboardLayout stocks={stocks} loading={loading} />
    </div>
  );
}

export default App;
