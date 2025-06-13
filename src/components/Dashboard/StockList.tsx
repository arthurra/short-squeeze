import React from "react";
import { StockCard } from "./StockCard";
import { StockData } from "../../lib/types/stock";
import styles from "../../styles/Dashboard.module.css";

interface StockListProps {
  stocks: StockData[];
}

export const StockList: React.FC<StockListProps> = ({ stocks }) => {
  return (
    <div className={styles.stockList}>
      {stocks.map((stock) => (
        <StockCard key={stock.symbol} stock={stock} />
      ))}
    </div>
  );
};
