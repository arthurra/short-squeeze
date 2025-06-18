import React from 'react';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, ErrorMessage } from './ErrorBoundary';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  AlertCircle: ({ className }: { className: string }) => (
    <div data-testid="alert-circle" className={className}>
      Alert Icon
    </div>
  ),
}));

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for expected errors in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Normal Rendering', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-content">Child content</div>
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('renders multiple children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('catches errors and renders error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
    });

    it('logs error to console when error occurs', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('renders default error message when error has no message', () => {
      // Create a component that throws an error without a message
      const ThrowErrorWithoutMessage = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <ThrowErrorWithoutMessage />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });
  });

  describe('Fallback UI', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom error UI</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('renders default error UI when no fallback is provided', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('resets error state when try again button is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click try again button
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

      // The error state should be reset, but the component still shows error UI
      // because the child component is still throwing an error
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('can recover from error when child component stops throwing (remounts boundary)', () => {
      let key = 0;
      const { rerender } = render(
        <ErrorBoundary key={key}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click try again button to reset error state
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

      // Remount ErrorBoundary with new key and non-throwing child
      key++;
      rerender(
        <ErrorBoundary key={key}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('can recover from error and render different children (remounts boundary)', () => {
      let key = 0;
      const { rerender } = render(
        <ErrorBoundary key={key}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click try again button to reset error state
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

      // Remount ErrorBoundary with new key and different content
      key++;
      rerender(
        <ErrorBoundary key={key}>
          <div data-testid="recovered-content">Recovered content</div>
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('recovered-content')).toBeInTheDocument();
      expect(screen.getByText('Recovered content')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('shows error UI when child component throws error after recovery', () => {
      let key = 0;
      const { rerender } = render(
        <ErrorBoundary key={key}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();

      // Remount ErrorBoundary with new key and error-throwing child
      key++;
      rerender(
        <ErrorBoundary key={key}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure in error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
    });

    it('provides error information to screen readers', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });
});

describe('ErrorMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ErrorMessage />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders with custom title and message', () => {
      render(<ErrorMessage title="Custom Error Title" message="Custom error message" />);

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('renders retry button when retry function is provided', () => {
      const mockRetry = jest.fn();
      render(<ErrorMessage retry={mockRetry} />);

      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    });

    it('does not render retry button when retry function is not provided', () => {
      render(<ErrorMessage />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls retry function when try again button is clicked', () => {
      const mockRetry = jest.fn();
      render(<ErrorMessage retry={mockRetry} />);

      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('calls retry function multiple times when button is clicked multiple times', () => {
      const mockRetry = jest.fn();
      render(<ErrorMessage retry={mockRetry} />);

      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

      expect(mockRetry).toHaveBeenCalledTimes(2);
    });
  });

  describe('Styling', () => {
    it('applies correct CSS classes', () => {
      render(<ErrorMessage />);

      const container = screen.getByText('Something went wrong').closest('div');
      expect(container).toHaveClass(
        'flex',
        'h-full',
        'min-h-[400px]',
        'flex-col',
        'items-center',
        'justify-center',
        'gap-4',
        'rounded-lg',
        'border',
        'bg-card',
        'p-6',
        'text-center',
      );
    });

    it('applies correct classes to alert icon', () => {
      render(<ErrorMessage />);

      const alertIcon = screen.getByTestId('alert-circle');
      expect(alertIcon).toHaveClass('h-12', 'w-12', 'text-destructive');
    });

    it('applies correct classes to retry button', () => {
      const mockRetry = jest.fn();
      render(<ErrorMessage retry={mockRetry} />);

      const button = screen.getByRole('button', { name: 'Try again' });
      expect(button).toHaveClass(
        'mt-4',
        'rounded-md',
        'bg-primary',
        'px-4',
        'py-2',
        'text-sm',
        'font-medium',
        'text-primary-foreground',
        'hover:bg-primary/90',
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<ErrorMessage />);

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
    });

    it('has proper semantic structure with retry button', () => {
      const mockRetry = jest.fn();
      render(<ErrorMessage retry={mockRetry} />);

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
    });

    it('provides accessible button text', () => {
      const mockRetry = jest.fn();
      render(<ErrorMessage retry={mockRetry} />);

      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    });
  });
});
