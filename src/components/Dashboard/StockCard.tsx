import React from "react";
import { StockData } from "../../lib/types/stock";
import { SparklineChart } from "./SparklineChart";
import styles from "../../styles/Dashboard.module.css";

interface StockCardProps {
  stock: StockData;
}

export const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const priceChangeClass =
    stock.change >= 0 ? styles.positiveChange : styles.negativeChange;

  return (
    <div className={styles.stockCard}>
      <div className={styles.stockHeader}>
        <div>
          <h3>{stock.symbol}</h3>
          <span className={styles.stockName}>{stock.name}</span>
        </div>
        <div className={styles.stockPrice}>
          <span className={styles.currentPrice}>${stock.price.toFixed(2)}</span>
          <span className={`${styles.priceChange} ${priceChangeClass}`}>
            {stock.change >= 0 ? "+" : ""}
            {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className={styles.stockDetails}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Volume:</span>
          <span className={styles.detailValue}>
            {stock.volume.toLocaleString()}
          </span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Market Cap:</span>
          <span className={styles.detailValue}>
            ${(stock.marketCap / 1000000).toFixed(2)}M
          </span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Exchange:</span>
          <span className={styles.detailValue}>{stock.exchange}</span>
        </div>
      </div>

      <div className={styles.sparklineContainer}>
        <SparklineChart data={[stock.price]} />
      </div>
    </div>
  );
};
