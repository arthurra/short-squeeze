'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: number[] | { date: string; price: number }[];
  color?: string;
  height?: number;
  width?: number;
}

interface ChartDataPoint {
  price: number;
  index: number;
}

export function SparklineChart({ data, color = 'rgb(34, 197, 94)' }: SparklineChartProps) {
  let chartData: ChartDataPoint[] = [];
  if (Array.isArray(data) && data.length > 0) {
    if (typeof data[0] === 'number') {
      chartData = (data as number[]).map((price, index) => ({ price, index }));
    } else if (typeof data[0] === 'object' && data[0] !== null && 'price' in data[0]) {
      chartData = (data as { date: string; price: number }[]).map((point, index) => ({
        price: point.price,
        index,
      }));
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%" data-testid="sparkline-chart">
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="price" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
