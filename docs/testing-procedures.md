# Testing Procedures Documentation

This document outlines the comprehensive testing strategy and procedures for the Penny Stock Insights Dashboard project.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Performance Testing](#performance-testing)
6. [Test Coverage](#test-coverage)
7. [Testing Best Practices](#testing-best-practices)
8. [Running Tests](#running-tests)
9. [Continuous Integration](#continuous-integration)

## Testing Overview

Our testing strategy follows a pyramid approach with multiple layers:

```
    E2E Tests (Few, Critical Paths)
         ▲
   Integration Tests (API, Data)
         ▲
   Unit Tests (Many, Components)
```

### Testing Stack

- **Unit & Integration Tests**: Jest + React Testing Library
- **E2E Tests**: Cypress
- **Performance Tests**: Custom performance monitoring + Sentry
- **Type Checking**: TypeScript
- **Linting**: ESLint + Prettier

## Unit Testing

### Framework Setup

We use Jest with React Testing Library for unit testing components and utilities.

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

### Component Testing

#### Example: StockCard Component Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { StockCard } from './StockCard';

describe('StockCard', () => {
  const mockStock = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 150.00,
    change: 2.5,
    volume: 1000000,
    marketCap: 2500000000000,
    shortInterest: 15.5,
    avgVolume: 800000,
    sector: 'Technology',
    industry: 'Consumer Electronics',
    priceHistory: [145, 148, 150, 152, 150],
  };

  it('renders stock information correctly', () => {
    render(<StockCard stock={mockStock} />);

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('displays positive change with green color', () => {
    render(<StockCard stock={mockStock} />);

    const changeElement = screen.getByText('+2.50%');
    expect(changeElement).toHaveClass('text-green-600');
  });

  it('navigates to stock detail on click', () => {
    const mockRouter = { push: jest.fn() };
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue(mockRouter);

    render(<StockCard stock={mockStock} />);

    fireEvent.click(screen.getByTestId('stock-card'));
    expect(mockRouter.push).toHaveBeenCalledWith('/stocks/AAPL');
  });
});
```

### Utility Testing

#### Example: Squeeze Score Calculation Test

```typescript
import { calculateSqueezeScore } from '@/lib/utils/squeezeScore';

describe('calculateSqueezeScore', () => {
  it('calculates high squeeze score for high volume and short interest', () => {
    const score = calculateSqueezeScore({
      volumeRatio: 3.5,
      shortInterestPercent: 25.0,
      priceChange: 15.0,
      hasRecentNews: true,
      hasRecentFilings: true,
    });

    expect(score).toBeGreaterThan(80);
  });

  it('returns low score for low volume and short interest', () => {
    const score = calculateSqueezeScore({
      volumeRatio: 0.8,
      shortInterestPercent: 5.0,
      priceChange: -2.0,
      hasRecentNews: false,
      hasRecentFilings: false,
    });

    expect(score).toBeLessThan(30);
  });
});
```

### Testing Best Practices for Unit Tests

1. **Use descriptive test names** that explain the expected behavior
2. **Test one thing at a time** - each test should have a single assertion
3. **Use data-testid attributes** for reliable element selection
4. **Mock external dependencies** (APIs, router, etc.)
5. **Test both success and error cases**
6. **Use setup and teardown** for common test data

## Integration Testing

### API Integration Tests

Test the integration between our application and external APIs.

```bash
# Run integration tests
npm run test:integration
```

#### Example: Stock Data API Integration Test

```typescript
import { getStockQuote } from '@/lib/api/stockData';

describe('Stock Data API Integration', () => {
  it('fetches stock quote successfully', async () => {
    const quote = await getStockQuote('AAPL');

    expect(quote).toHaveProperty('symbol', 'AAPL');
    expect(quote).toHaveProperty('price');
    expect(quote).toHaveProperty('volume');
    expect(typeof quote.price).toBe('number');
  });

  it('handles API errors gracefully', async () => {
    await expect(getStockQuote('INVALID')).rejects.toThrow();
  });
});
```

### Data Flow Integration Tests

Test the complete data flow from API to UI.

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { StockList } from '@/components/StockList';

describe('StockList Integration', () => {
  it('loads and displays stock data', async () => {
    render(<StockList filters={{}} />);

    // Check loading state
    expect(screen.getByTestId('loading-card')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-card')).not.toBeInTheDocument();
    });

    // Verify stock cards are rendered
    expect(screen.getAllByTestId('stock-card')).toHaveLength(6);
  });
});
```

## End-to-End Testing

### Cypress Setup

We use Cypress for E2E testing of critical user flows.

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run Cypress tests headlessly
npm run cypress:run
```

### Critical User Flows

#### Dashboard E2E Tests

```typescript
// cypress/e2e/dashboard.cy.ts
describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('loads dashboard with stock list', () => {
    cy.get('[data-testid="stock-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="stock-symbol"]').should('be.visible');
  });

  it('filters stocks by search', () => {
    cy.get('[data-testid="search-input"]').type('AAPL');
    cy.get('[data-testid="stock-card"]').should('contain.text', 'AAPL');
  });

  it('applies price range filter', () => {
    cy.get('[data-testid="price-range-select"]').click();
    cy.get('[data-testid="price-1-5"]').click();
    cy.get('[data-testid="stock-price"]').each(($price) => {
      const price = parseFloat($price.text().replace('$', ''));
      expect(price).to.be.at.least(1).and.to.be.at.most(5);
    });
  });

  it('navigates to stock detail page', () => {
    cy.get('[data-testid="stock-card"]').first().click();
    cy.url().should('include', '/stocks/');
    cy.get('[data-testid="stock-detail"]').should('be.visible');
  });
});
```

#### Stock Detail E2E Tests

```typescript
// cypress/e2e/stock-detail.cy.ts
describe('Stock Detail Page E2E Tests', () => {
  it('displays stock information correctly', () => {
    cy.visit('/stocks/AAPL');

    cy.get('[data-testid="stock-symbol"]').should('contain', 'AAPL');
    cy.get('[data-testid="stock-price"]').should('be.visible');
    cy.get('[data-testid="price-chart"]').should('be.visible');
  });

  it('shows sparkline chart', () => {
    cy.visit('/stocks/AAPL');
    cy.get('[data-testid="sparkline-chart"]').should('be.visible');
  });

  it('displays market metrics', () => {
    cy.visit('/stocks/AAPL');

    cy.get('[data-testid="stock-market-cap"]').should('be.visible');
    cy.get('[data-testid="stock-volume"]').should('be.visible');
    cy.get('[data-testid="stock-short-interest"]').should('be.visible');
  });
});
```

### Mobile Responsiveness Tests

```typescript
describe('Mobile Responsiveness', () => {
  it('displays mobile sidebar on small screens', () => {
    cy.viewport('iphone-x');
    cy.visit('/dashboard');

    cy.get('[data-testid="mobile-sidebar"]').should('not.be.visible');
    cy.get('[data-testid="menu-button"]').click();
    cy.get('[data-testid="mobile-sidebar"]').should('be.visible');
  });

  it('has responsive grid layout', () => {
    cy.viewport('macbook-13');
    cy.visit('/dashboard');
    cy.get('[data-testid="stock-grid"]').should('have.class', 'lg:grid-cols-3');
  });
});
```

## Performance Testing

### Core Web Vitals Monitoring

Our performance monitoring system tracks key metrics automatically.

#### Performance Thresholds

```typescript
const PERFORMANCE_THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100, // First Input Delay (ms)
  CLS: 0.1, // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint (ms)
  TTFB: 800, // Time to First Byte (ms)
};
```

#### Performance Test Example

```typescript
describe('Performance Tests', () => {
  it('loads dashboard within performance budget', () => {
    cy.visit('/dashboard', {
      onBeforeLoad: (win) => {
        cy.spy(win.console, 'log').as('consoleLog');
      },
    });

    // Wait for page to load
    cy.get('[data-testid="stock-card"]').should('be.visible');

    // Check performance metrics
    cy.window().then((win) => {
      const navigation = win.performance.getEntriesByType('navigation')[0];
      expect(navigation.loadEventEnd - navigation.loadEventStart).to.be.lessThan(3000);
    });
  });

  it('renders sparkline charts efficiently', () => {
    cy.visit('/stocks/AAPL');

    const startTime = performance.now();
    cy.get('[data-testid="sparkline-chart"]').should('be.visible');
    const endTime = performance.now();

    expect(endTime - startTime).to.be.lessThan(1000);
  });
});
```

### Bundle Size Testing

```bash
# Analyze bundle size
ANALYZE=true npm run build
```

## Test Coverage

### Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ coverage
- **E2E Tests**: Critical user flows (100%)
- **Performance Tests**: Core Web Vitals monitoring

### Coverage Report

```bash
# Generate coverage report
npm run test -- --coverage --watchAll=false
```

Coverage is tracked for:

- Statements
- Branches
- Functions
- Lines

## Testing Best Practices

### 1. Test Organization

```
src/
├── components/
│   ├── StockCard.tsx
│   ├── StockCard.test.tsx
│   └── StockList.tsx
├── lib/
│   ├── utils/
│   │   ├── squeezeScore.ts
│   │   └── squeezeScore.test.ts
│   └── api/
│       ├── stockData.ts
│       └── stockData.integration.test.ts
```

### 2. Naming Conventions

- Test files: `ComponentName.test.tsx` or `ComponentName.spec.tsx`
- Integration tests: `ComponentName.integration.test.ts`
- E2E tests: `feature-name.cy.ts`

### 3. Test Data Management

```typescript
// Use factories for test data
const createMockStock = (overrides = {}) => ({
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 150.0,
  change: 2.5,
  volume: 1000000,
  marketCap: 2500000000000,
  shortInterest: 15.5,
  avgVolume: 800000,
  sector: 'Technology',
  industry: 'Consumer Electronics',
  priceHistory: [145, 148, 150, 152, 150],
  ...overrides,
});
```

### 4. Mocking Strategies

```typescript
// Mock external dependencies
jest.mock('@/lib/api/stockData', () => ({
  getStockQuote: jest.fn(),
  getStockDetails: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));
```

## Running Tests

### Development Workflow

```bash
# Run tests in watch mode during development
npm run test:watch

# Run specific test file
npm run test StockCard.test.tsx

# Run tests matching pattern
npm run test -- --testNamePattern="renders correctly"
```

### Pre-commit Hooks

Tests are automatically run before commits via Husky:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "npm run test:unit -- --findRelatedTests"]
  }
}
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run cypress:run
      - run: npm run build
```

## Continuous Integration

### Automated Testing Pipeline

1. **Unit Tests**: Run on every commit
2. **Integration Tests**: Run on pull requests
3. **E2E Tests**: Run on main branch
4. **Performance Tests**: Run on production deployments

### Quality Gates

- All tests must pass
- Coverage thresholds must be met
- Performance budgets must be maintained
- No critical accessibility issues

### Monitoring and Alerts

- Test failure notifications
- Performance regression alerts
- Coverage trend monitoring
- Build time tracking

## Troubleshooting

### Common Issues

1. **Test Environment Setup**

   ```bash
   # Clear Jest cache
   npm run test -- --clearCache

   # Reset node_modules
   rm -rf node_modules && npm install
   ```

2. **Cypress Issues**

   ```bash
   # Clear Cypress cache
   npx cypress cache clear

   # Run with debug logging
   DEBUG=cypress:* npm run cypress:run
   ```

3. **Performance Test Failures**
   - Check network conditions
   - Verify test data consistency
   - Review performance budgets

### Debugging Tests

```typescript
// Add debug logging
it('debug test', () => {
  console.log('Debug info:', someVariable);
  debugger; // Pause execution in browser
  expect(result).toBe(expected);
});
```

## Conclusion

This testing strategy ensures:

- **Reliability**: Comprehensive test coverage
- **Performance**: Continuous monitoring and optimization
- **Maintainability**: Clear test organization and documentation
- **Quality**: Automated quality gates and alerts

For questions or improvements to this testing documentation, please refer to the project's contributing guidelines.
