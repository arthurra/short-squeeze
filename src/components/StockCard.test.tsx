import React from 'react';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { StockCard } from './StockCard';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock SparklineChart component
jest.mock('./SparklineChart', () => ({
  SparklineChart: ({ data }) => (
    <div data-testid="sparkline-chart" data-price-history={data.join(',')}>
      Sparkline Chart
    </div>
  ),
}));

describe('StockCard', () => {
  const mockStock = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 150.25,
    change: 2.5,
    volume: 50000000,
    marketCap: 2500000000000,
    shortInterest: 15.5,
    avgVolume: 45000000,
    sector: 'Technology',
    industry: 'Consumer Electronics',
    priceHistory: [145, 148, 152, 150, 153, 151, 150.25],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders stock information correctly', () => {
      render(<StockCard stock={mockStock} />);

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('$150.25')).toBeInTheDocument();
      expect(screen.getByText('2.50%')).toBeInTheDocument();
      expect(screen.getByText(/Vol: 50,000,000/)).toBeInTheDocument();
      expect(
        screen.getByText((content, node) => {
          const hasText =
            node.textContent === 'MCap: $2500000.0M' ||
            node.textContent === 'MCap: $2,500,000.0M' ||
            node.textContent.replace(/\s/g, '') === 'MCap:$2500000.0M';
          return hasText;
        }),
      ).toBeInTheDocument();
    });

    it('renders with positive change styling', () => {
      render(<StockCard stock={mockStock} />);

      const changeElement = screen.getByText('2.50%');
      expect(changeElement).toHaveClass('text-green-600');
    });

    it('renders with negative change styling', () => {
      const negativeStock = { ...mockStock, change: -1.5 };
      render(<StockCard stock={negativeStock} />);

      const changeElement = screen.getByText('1.50%');
      expect(changeElement).toHaveClass('text-red-600');
    });

    it('renders sparkline chart with correct data', () => {
      render(<StockCard stock={mockStock} />);

      const sparkline = screen.getByTestId('sparkline-chart');
      expect(sparkline).toBeInTheDocument();
      expect(sparkline).toHaveAttribute('data-price-history', mockStock.priceHistory.join(','));
    });
  });

  describe('Compact variant', () => {
    it('renders compact variant by default', () => {
      render(<StockCard stock={mockStock} />);

      // Should not show detailed information
      expect(screen.queryByText('Short Interest')).not.toBeInTheDocument();
      expect(screen.queryByText('Avg Volume')).not.toBeInTheDocument();
      expect(screen.queryByText('Sector')).not.toBeInTheDocument();
      expect(screen.queryByText('Industry')).not.toBeInTheDocument();
    });

    it('explicitly renders compact variant', () => {
      render(<StockCard stock={mockStock} variant="compact" />);

      // Should not show detailed information
      expect(screen.queryByText('Short Interest')).not.toBeInTheDocument();
      expect(screen.queryByText('Avg Volume')).not.toBeInTheDocument();
      expect(screen.queryByText('Sector')).not.toBeInTheDocument();
      expect(screen.queryByText('Industry')).not.toBeInTheDocument();
    });
  });

  describe('Detailed variant', () => {
    it('renders detailed variant with additional information', () => {
      render(<StockCard stock={mockStock} variant="detailed" />);

      // Should show detailed information
      expect(screen.getByText('Short Interest')).toBeInTheDocument();
      expect(screen.getByText('15.5%')).toBeInTheDocument();
      expect(screen.getByText('Avg Volume')).toBeInTheDocument();
      expect(screen.getByText('45,000,000')).toBeInTheDocument();
      expect(screen.getByText('Sector')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Industry')).toBeInTheDocument();
      expect(screen.getByText('Consumer Electronics')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('navigates to stock detail page when clicked', () => {
      render(<StockCard stock={mockStock} />);

      const card = screen.getByText('AAPL').closest('div');
      fireEvent.click(card!);

      expect(mockPush).toHaveBeenCalledWith('/stocks/AAPL');
    });

    it('has hover styling', () => {
      render(<StockCard stock={mockStock} />);

      // Find the card container that has the cursor-pointer class
      const card = screen.getByText('AAPL').closest('div[class*="cursor-pointer"]');
      expect(card).toBeInTheDocument();
      expect(card?.className).toContain('cursor-pointer');
    });
  });

  describe('Edge cases', () => {
    it('handles zero change correctly', () => {
      const zeroChangeStock = { ...mockStock, change: 0 };
      render(<StockCard stock={zeroChangeStock} />);

      const changeElement = screen.getByText('0.00%');
      expect(changeElement).toHaveClass('text-green-600'); // Zero is treated as positive
    });

    it('handles very small numbers correctly', () => {
      const smallChangeStock = { ...mockStock, change: 0.001 };
      render(<StockCard stock={smallChangeStock} />);

      expect(screen.getByText('0.00%')).toBeInTheDocument();
    });

    it('handles very large numbers correctly', () => {
      const largeChangeStock = { ...mockStock, change: 999.99 };
      render(<StockCard stock={largeChangeStock} />);

      expect(screen.getByText('999.99%')).toBeInTheDocument();
    });

    it('handles empty price history', () => {
      const emptyHistoryStock = { ...mockStock, priceHistory: [] };
      render(<StockCard stock={emptyHistoryStock} />);

      const sparkline = screen.getByTestId('sparkline-chart');
      expect(sparkline).toHaveAttribute('data-price-history', '');
    });

    it('handles very large market cap', () => {
      const largeCapStock = { ...mockStock, marketCap: 999999999999999 };
      render(<StockCard stock={largeCapStock} />);

      // Check for the presence of market cap text with the large value
      const marketCapElements = screen.getAllByText(
        (content, node) =>
          node.textContent && node.textContent.includes('MCap:') && node.textContent.includes('M'),
      );
      expect(marketCapElements.length).toBeGreaterThan(0);
    });

    it('handles very small market cap', () => {
      const smallCapStock = { ...mockStock, marketCap: 1000000 };
      render(<StockCard stock={smallCapStock} />);

      // Find the market cap element specifically
      const marketCapDivs = screen.getAllByText(
        (content, node) =>
          node.textContent && node.textContent.replace(/\s/g, '').includes('MCap:$1.0M'),
      );
      expect(marketCapDivs.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<StockCard stock={mockStock} />);

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    // it('is keyboard accessible', () => {
    //   render(<StockCard stock={mockStock} />);
    //
    //   const card = screen.getByText('AAPL').closest('div');
    //   expect(card).toHaveAttribute('tabIndex', '0');
    // });
  });
});
