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
  const chartData: ChartDataPoint[] =
    Array.isArray(data) && typeof data[0] === 'number'
      ? (data as number[]).map((price, index) => ({
          price,
          index,
        }))
      : (data as { date: string; price: number }[]).map((point, index) => ({
          price: point.price,
          index,
        }));

  return (
    <ResponsiveContainer width="100%" height="100%" data-testid="sparkline-chart">
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="price" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
