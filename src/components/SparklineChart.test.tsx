import React from 'react';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { SparklineChart } from './SparklineChart';

// Mock recharts components
jest.mock('recharts', () => ({
  Line: ({ dataKey, stroke, strokeWidth, dot, type }: any) => (
    <div
      data-testid="line"
      data-key={dataKey}
      data-stroke={stroke}
      data-width={strokeWidth}
      data-dot={dot}
      data-type={type}
    >
      Line Chart
    </div>
  ),
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-points={data.length}>
      {children}
    </div>
  ),
  ResponsiveContainer: ({ children, width, height }: any) => (
    <div data-testid="responsive-container" data-width={width} data-height={height}>
      {children}
    </div>
  ),
}));

describe('SparklineChart', () => {
  const mockNumberData = [10, 15, 12, 18, 20, 16, 22];
  const mockObjectData = [
    { date: '2024-01-01', price: 10 },
    { date: '2024-01-02', price: 15 },
    { date: '2024-01-03', price: 12 },
    { date: '2024-01-04', price: 18 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with number array data', () => {
      render(<SparklineChart data={mockNumberData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line')).toBeInTheDocument();
    });

    it('renders with object array data', () => {
      render(<SparklineChart data={mockObjectData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line')).toBeInTheDocument();
    });

    it('renders with empty data array', () => {
      render(<SparklineChart data={[]} />);

      expect(screen.getByTestId('line-chart')).toHaveAttribute('data-points', '0');
    });

    it('renders with single data point', () => {
      render(<SparklineChart data={[10]} />);

      expect(screen.getByTestId('line-chart')).toHaveAttribute('data-points', '1');
    });
  });

  describe('Data Transformation', () => {
    it('transforms number array data correctly', () => {
      render(<SparklineChart data={mockNumberData} />);

      const lineChart = screen.getByTestId('line-chart');
      expect(lineChart).toHaveAttribute('data-points', '7');

      // Check that the Line component receives the correct props
      const line = screen.getByTestId('line');
      expect(line).toHaveAttribute('data-key', 'price');
      expect(line).toHaveAttribute('data-type', 'monotone');
      expect(line).toHaveAttribute('data-dot', 'false');
    });

    it('transforms object array data correctly', () => {
      render(<SparklineChart data={mockObjectData} />);

      const lineChart = screen.getByTestId('line-chart');
      expect(lineChart).toHaveAttribute('data-points', '4');
    });

    it('handles mixed data types gracefully', () => {
      // This should handle the case where data might be malformed
      const mixedData = [10, { date: '2024-01-01', price: 15 }, 12];
      render(<SparklineChart data={mixedData as any} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('uses default color when no color prop is provided', () => {
      render(<SparklineChart data={mockNumberData} />);

      const line = screen.getByTestId('line');
      expect(line).toHaveAttribute('data-stroke', 'rgb(34, 197, 94)');
    });

    it('uses custom color when provided', () => {
      const customColor = 'rgb(255, 0, 0)';
      render(<SparklineChart data={mockNumberData} color={customColor} />);

      const line = screen.getByTestId('line');
      expect(line).toHaveAttribute('data-stroke', customColor);
    });

    it('sets correct responsive container dimensions', () => {
      render(<SparklineChart data={mockNumberData} />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('data-width', '100%');
      expect(container).toHaveAttribute('data-height', '100%');
    });

    it('sets correct line properties', () => {
      render(<SparklineChart data={mockNumberData} />);

      const line = screen.getByTestId('line');
      expect(line).toHaveAttribute('data-key', 'price');
      expect(line).toHaveAttribute('data-type', 'monotone');
      expect(line).toHaveAttribute('data-width', '2');
      expect(line).toHaveAttribute('data-dot', 'false');
    });
  });

  describe('Edge Cases', () => {
    it('handles very large datasets', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => i);
      render(<SparklineChart data={largeDataset} />);

      const lineChart = screen.getByTestId('line-chart');
      expect(lineChart).toHaveAttribute('data-points', '1000');
    });

    it('handles negative values', () => {
      const negativeData = [-10, -5, -15, -8];
      render(<SparklineChart data={negativeData} />);

      expect(screen.getByTestId('line-chart')).toHaveAttribute('data-points', '4');
    });

    it('handles decimal values', () => {
      const decimalData = [10.5, 15.7, 12.3, 18.9];
      render(<SparklineChart data={decimalData} />);

      expect(screen.getByTestId('line-chart')).toHaveAttribute('data-points', '4');
    });
  });

  describe('Accessibility', () => {
    it('renders chart elements with proper structure', () => {
      render(<SparklineChart data={mockNumberData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line')).toBeInTheDocument();
    });

    it('maintains chart structure with different data types', () => {
      render(<SparklineChart data={mockObjectData} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with large datasets', () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => i);

      const startTime = performance.now();
      render(<SparklineChart data={largeDataset} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should render in less than 1 second
      expect(screen.getByTestId('line-chart')).toHaveAttribute('data-points', '10000');
    });
  });
});
