# Testing Quick Reference

A quick reference guide for testing commands and common patterns in the Penny Stock Insights Dashboard project.

## Quick Commands

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test StockCard.test.tsx

# Run tests with coverage
npm run test -- --coverage

# Run tests matching pattern
npm run test -- --testNamePattern="renders correctly"
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run specific integration test
npm run test stockData.integration.test.ts
```

### E2E Tests

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run Cypress tests headlessly
npm run cypress:run

# Run specific E2E test
npx cypress run --spec "cypress/e2e/dashboard.cy.ts"
```

### Performance Tests

```bash
# Analyze bundle size
ANALYZE=true npm run build

# Check performance metrics
# (Available in development mode via PerformanceMonitor component)
```

## Common Test Patterns

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByTestId('component')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByTestId('button'));
    expect(screen.getByText('Expected Result')).toBeInTheDocument();
  });
});
```

### API Testing

```typescript
import { getStockQuote } from '@/lib/api/stockData';

describe('API Integration', () => {
  it('fetches data successfully', async () => {
    const result = await getStockQuote('AAPL');
    expect(result).toHaveProperty('symbol', 'AAPL');
  });

  it('handles errors gracefully', async () => {
    await expect(getStockQuote('INVALID')).rejects.toThrow();
  });
});
```

### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useStockFilters } from '@/lib/hooks/useStockFilters';

describe('useStockFilters', () => {
  it('initializes with default filters', () => {
    const { result } = renderHook(() => useStockFilters());
    expect(result.current.filters.search).toBe('');
  });

  it('updates filters correctly', () => {
    const { result } = renderHook(() => useStockFilters());

    act(() => {
      result.current.updateFilters({ search: 'AAPL' });
    });

    expect(result.current.filters.search).toBe('AAPL');
  });
});
```

### E2E Testing

```typescript
describe('Feature E2E', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('completes user flow', () => {
    cy.get('[data-testid="search-input"]').type('AAPL');
    cy.get('[data-testid="stock-card"]').first().click();
    cy.url().should('include', '/stocks/AAPL');
    cy.get('[data-testid="stock-detail"]').should('be.visible');
  });
});
```

## Test Data Factories

### Stock Data Factory

```typescript
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

### Filter Data Factory

```typescript
const createMockFilters = (overrides = {}) => ({
  search: '',
  sector: 'All Sectors',
  industry: 'All Industries',
  priceRange: 'Any Price',
  marketCapRange: 'Any Market Cap',
  shortInterestRange: 'Any Short Interest',
  volumeRange: 'Any Volume',
  volumeSpikeThreshold: 1,
  dilutionRisk: 'Any Risk',
  ...overrides,
});
```

## Common Mocks

### Next.js Router

```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));
```

### API Calls

```typescript
jest.mock('@/lib/api/stockData', () => ({
  getStockQuote: jest.fn(),
  getStockDetails: jest.fn(),
}));
```

### External Libraries

```typescript
jest.mock('recharts', () => ({
  Line: ({ dataKey, stroke }: any) => (
    <div data-testid="line" data-key={dataKey} data-stroke={stroke}>
      Line Chart
    </div>
  ),
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-points={data.length}>
      {children}
    </div>
  ),
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));
```

## Performance Testing

### Core Web Vitals Thresholds

```typescript
const PERFORMANCE_THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100, // First Input Delay (ms)
  CLS: 0.1, // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint (ms)
  TTFB: 800, // Time to First Byte (ms)
};
```

### Performance Test Example

```typescript
it('loads within performance budget', () => {
  const startTime = performance.now();
  render(<Component />);
  const endTime = performance.now();

  expect(endTime - startTime).toBeLessThan(100);
});
```

## Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ coverage
- **E2E Tests**: Critical user flows (100%)
- **Performance Tests**: Core Web Vitals monitoring

## Troubleshooting

### Clear Caches

```bash
# Jest cache
npm run test -- --clearCache

# Cypress cache
npx cypress cache clear

# Node modules
rm -rf node_modules && npm install
```

### Debug Tests

```typescript
// Add debug logging
console.log('Debug info:', variable);

// Pause execution
debugger;

// Mock console methods
jest.spyOn(console, 'log').mockImplementation(() => {});
```

### Common Issues

1. **Test not finding elements**: Use `data-testid` attributes
2. **Async operations**: Use `waitFor` or `findBy` queries
3. **Mock not working**: Check import paths and mock setup
4. **Performance test failures**: Check network conditions and test data

## Best Practices

1. **Use descriptive test names** that explain expected behavior
2. **Test one thing at a time** - single assertion per test
3. **Use data-testid attributes** for reliable element selection
4. **Mock external dependencies** consistently
5. **Test both success and error cases**
6. **Keep tests independent** - no shared state between tests
7. **Use test data factories** for consistent mock data
8. **Follow AAA pattern**: Arrange, Act, Assert

## File Organization

```
src/
├── components/
│   ├── ComponentName.tsx
│   └── ComponentName.test.tsx
├── lib/
│   ├── utils/
│   │   ├── utility.ts
│   │   └── utility.test.ts
│   └── api/
│       ├── api.ts
│       └── api.integration.test.ts
└── cypress/
    └── e2e/
        └── feature.cy.ts
```
