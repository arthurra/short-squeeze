# Penny Stock Insights Dashboard

A real-time dashboard for tracking and analyzing penny stocks with short squeeze potential. Built with Next.js 14, TypeScript, and modern web technologies.

## Features

- Real-time penny stock monitoring
- Short squeeze signal detection
- Advanced filtering and sorting
- Mobile-first responsive design
- Dark/light mode support
- Real-time data updates

## Tech Stack

- **Framework:** Next.js 14 with TypeScript
- **Styling:** Tailwind CSS with shadcn/ui
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Caching:** Vercel KV
- **Testing:** Jest, React Testing Library, Cypress
- **Error Tracking:** Sentry
- **Code Quality:** ESLint, Prettier, Husky

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm 9.0 or later
- Vercel account (for deployment)
- Sentry account (for error tracking)

### Installation

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd short-squeeze
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required environment variables in `.env.local`:

   - `KV_URL`: Vercel KV database URL
   - `KV_REST_API_URL`: Vercel KV REST API URL
   - `KV_REST_API_TOKEN`: Vercel KV API token
   - `KV_REST_API_READ_ONLY_TOKEN`: Vercel KV read-only token
   - `YAHOO_FINANCE_API_KEY`: Yahoo Finance API key
   - `POLYGON_API_KEY`: Polygon.io API key
   - `NEXT_PUBLIC_SENTRY_DSN`: Sentry DSN for error tracking

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier
- `npm test`: Run unit tests
- `npm run test:e2e`: Run E2E tests with Cypress

### Code Style

- We use ESLint and Prettier for code formatting
- Pre-commit hooks are configured with Husky
- Follow the TypeScript strict mode guidelines
- Write tests for all new features

### Testing

### Unit Tests

Run unit tests with:

```bash
npm test
```

Or run specific test files:

```bash
npm test -- [file-path]
```

### Integration Tests

Integration tests use real Polygon.io API calls and require a valid API key. Set your API key in the environment:

```bash
export POLYGON_API_KEY=your_api_key_here
```

Run integration tests:

```bash
npm run test:integration
```

Run only unit tests (excluding integration tests):

```bash
npm run test:unit
```

### End-to-End Tests

Run Cypress E2E tests:

```bash
npm run cypress:run
```

Or open Cypress in interactive mode:

```bash
npm run cypress:open
```

### Component Tests

Run component tests:

```bash
npm run test:components
```

### Error Tracking

- Sentry is configured for error tracking
- Client and server-side errors are automatically captured
- Error boundaries are implemented for graceful error handling

## Deployment

The project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Performance Optimization

### Bundle Size Optimization (Task 6.4)

- Enabled the [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer) to inspect the production bundle and identify large dependencies.
- Identified `recharts` (used in `SparklineChart`) as a significant contributor to bundle size.
- Refactored `StockCard` and `StockDetail` components to dynamically import `SparklineChart` using `next/dynamic` with `ssr: false`. This enables code splitting and ensures the charting library is only loaded when needed, reducing the main bundle size and improving initial load performance.
- To analyze the bundle, run:
  ```sh
  ANALYZE=true npm run build
  ```

### Code Splitting and Lazy Loading (Task 6.5)

- Implemented dynamic imports for heavy components to reduce initial bundle size:
  - **`StockDetail`** - Lazy loaded in stock detail page with loading fallback
  - **`StockFilters`** - Lazy loaded in dashboard with skeleton loading state
  - **`DataRefreshIndicator`** - Lazy loaded in `StockList` component
  - **`ErrorMessage`** - Lazy loaded in both stock detail and list components
- **Bundle size improvements achieved:**
  - Dashboard page: `37.5 kB` → `17.3 kB` (**53.9% reduction**)
  - Stock detail page: `3.13 kB` → `1.38 kB` (**55.9% reduction**)
  - Total First Load JS for dashboard: `130 kB` → `109 kB` (**16.2% reduction**)
- All lazy-loaded components use `ssr: false` to ensure proper client-side rendering and avoid hydration mismatches.

### Performance Monitoring (Task 6.6)

- **Enhanced Sentry Integration:**
  - Configured comprehensive performance monitoring with browser tracing and session replay
  - Implemented adaptive sampling rates (10% in production, 100% in development)
  - Added environment-specific configuration and release tracking
- **Core Web Vitals Tracking:**
  - Real-time monitoring of LCP (Largest Contentful Paint), FID (First Input Delay), CLS (Cumulative Layout Shift)
  - Automatic threshold alerts for performance degradation
  - Page load performance tracking with TTFB and FCP metrics
- **Custom Performance Metrics:**
  - Component render time tracking with performance hooks
  - API call duration monitoring with slow call detection
  - User interaction performance tracking
  - Route change and navigation performance
- **Development Tools:**
  - Real-time performance monitor dashboard (development only)
  - Performance measurement utilities and hooks
  - Console logging for performance metrics in development
- **Performance Hooks:**
  - `usePerformanceTracking()` - Track component render times
  - `usePagePerformance()` - Monitor page load performance
  - `useChartPerformance()` - Track chart rendering performance
  - `useFilterPerformance()` - Monitor filter application performance

## Testing

### Testing Strategy

This project follows a comprehensive testing strategy with multiple layers:

- **Unit Tests**: Jest + React Testing Library for component and utility testing
- **Integration Tests**: API integration and data flow testing
- **E2E Tests**: Cypress for critical user flow testing
- **Performance Tests**: Custom performance monitoring and Core Web Vitals tracking

### Quick Start

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run cypress:run

# Run tests with coverage
npm run test -- --coverage
```

### Documentation

- **[Comprehensive Testing Guide](docs/testing-procedures.md)** - Complete testing strategy, best practices, and procedures
- **[Testing Quick Reference](docs/testing-quick-reference.md)** - Quick commands and common patterns
- **[E2E Test Examples](cypress/e2e/)** - Cypress test examples for critical user flows

### Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ coverage
- **E2E Tests**: Critical user flows (100%)
- **Performance Tests**: Core Web Vitals monitoring

### Testing Best Practices

- Use `data-testid` attributes for reliable element selection
- Test both success and error cases
- Mock external dependencies consistently
- Follow AAA pattern: Arrange, Act, Assert
- Keep tests independent with no shared state
