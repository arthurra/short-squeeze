import React from "react";
import { StockData } from "../../lib/types/stock";
import { SparklineChart } from "./SparklineChart";
import { SqueezeScoreService } from "../../services/squeezeScoreService";
import styles from "../../styles/Dashboard.module.css";

interface StockCardProps {
  stock: StockData;
}

export const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const priceChangeClass =
    stock.change >= 0 ? styles.positiveChange : styles.negativeChange;

  const squeezeScore =
    SqueezeScoreService.getInstance().calculateBasicScore(stock);
  const scoreClass = getScoreClass(squeezeScore);

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
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Squeeze Score:</span>
          <span className={`${styles.detailValue} ${scoreClass}`}>
            {squeezeScore}
          </span>
        </div>
      </div>

      <div className={styles.sparklineContainer}>
        <SparklineChart data={[stock.price]} />
      </div>
    </div>
  );
};

/**
 * Gets the CSS class for the squeeze score based on its value
 * @param score The squeeze score (0-100)
 * @returns CSS class name
 */
function getScoreClass(score: number): string {
  if (score >= 80) return styles.scoreHigh;
  if (score >= 60) return styles.scoreMedium;
  if (score >= 40) return styles.scoreLow;
  return styles.scoreVeryLow;
}
