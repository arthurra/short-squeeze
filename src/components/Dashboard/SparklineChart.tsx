import React from "react";
import styles from "../../styles/Dashboard.module.css";

interface SparklineChartProps {
  data: number[];
}

export const SparklineChart: React.FC<SparklineChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className={styles.sparklinePlaceholder}>No data available</div>;
  }

  // TODO: Implement actual sparkline chart
  return (
    <div className={styles.sparklineChart}>
      <div className={styles.sparklinePlaceholder}>Chart coming soon</div>
    </div>
  );
};
