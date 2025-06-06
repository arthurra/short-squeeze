## Relevant Files

- `components/StockDetail/StockDetailView.tsx` - Main component for the stock detail view
- `components/StockDetail/StockDetailView.test.tsx` - Unit tests for StockDetailView
- `components/StockDetail/PriceChart.tsx` - Interactive price chart component
- `components/StockDetail/PriceChart.test.tsx` - Unit tests for PriceChart
- `components/StockDetail/KeyMetrics.tsx` - Component for displaying key metrics
- `components/StockDetail/KeyMetrics.test.tsx` - Unit tests for KeyMetrics
- `components/StockDetail/AIAnalysis.tsx` - AI-powered analysis component
- `components/StockDetail/AIAnalysis.test.tsx` - Unit tests for AIAnalysis
- `lib/api/stockData.ts` - API service for fetching stock data
- `lib/api/stockData.test.ts` - Unit tests for stock data API
- `lib/utils/chartHelpers.ts` - Utility functions for chart calculations
- `lib/utils/chartHelpers.test.ts` - Unit tests for chart helpers
- `lib/utils/metricsCalculations.ts` - Utility functions for metrics calculations
- `lib/utils/metricsCalculations.test.ts` - Unit tests for metrics calculations
- `types/stock.ts` - TypeScript interfaces for stock data
- `styles/StockDetail.module.css` - Styles for stock detail components

### Notes

- Unit tests should be placed alongside their corresponding components
- Use `npx jest` to run all tests or `npx jest [path/to/test]` for specific tests
- Ensure all components are mobile-responsive
- Follow accessibility guidelines for all interactive elements
- Implement proper error handling and loading states

## Tasks

- [ ] 1.0 Implement Core Layout and Navigation Structure

  - [ ] 1.1 Create base StockDetailView component with responsive layout
  - [ ] 1.2 Implement section containers for Top, Key Metrics, and AI Analysis
  - [ ] 1.3 Add loading and error state components
  - [ ] 1.4 Implement mobile-responsive design breakpoints
  - [ ] 1.5 Add accessibility features (ARIA labels, keyboard navigation)

- [ ] 2.0 Develop Top Section with Price Chart and Key Metrics

  - [ ] 2.1 Create header with ticker symbol and company logo
  - [ ] 2.2 Implement current price display with gain/loss percentage
  - [ ] 2.3 Build Squeeze Potential Score component with visual indicator
  - [ ] 2.4 Develop interactive price chart component
    - [ ] 2.4.1 Add 1M default view
    - [ ] 2.4.2 Implement 1W and 3M view toggles
    - [ ] 2.4.3 Add "Last breakout" marker functionality
    - [ ] 2.4.4 Implement volume overlay option
  - [ ] 2.5 Create chart interaction handlers and animations

- [ ] 3.0 Build Key Metrics Section with Data Integration

  - [ ] 3.1 Implement Float Size display with historical context
  - [ ] 3.2 Create Short Interest % component with trend visualization
  - [ ] 3.3 Build Volume vs 30-day Average comparison
  - [ ] 3.4 Add Market Cap and Borrow Cost displays
  - [ ] 3.5 Implement Insider/Institutional Activity section
  - [ ] 3.6 Create Sentiment Tag component with visual indicators
  - [ ] 3.7 Add data refresh and update mechanisms

- [ ] 4.0 Create AI-Powered Analysis Component

  - [ ] 4.1 Implement plain-English analysis display
  - [ ] 4.2 Create catalysts and risks section
  - [ ] 4.3 Build technical and fundamental context display
  - [ ] 4.4 Implement optional checklist view
    - [ ] 4.4.1 Add Short Interest > 15% check
    - [ ] 4.4.2 Add Low Float < 20M check
    - [ ] 4.4.3 Add Unusual Volume check
    - [ ] 4.4.4 Add Recent News check
    - [ ] 4.4.5 Add Clean Share Structure check
  - [ ] 4.5 Create AI analysis refresh mechanism

- [ ] 5.0 Implement Data Integration and API Services
  - [ ] 5.1 Set up real-time price data integration
  - [ ] 5.2 Implement SEC filings database connection
  - [ ] 5.3 Add News API integration
  - [ ] 5.4 Create social media sentiment analysis service
  - [ ] 5.5 Implement institutional ownership data fetching
  - [ ] 5.6 Add short interest data integration
  - [ ] 5.7 Create data caching strategy
  - [ ] 5.8 Implement API rate limit management
  - [ ] 5.9 Add error handling and retry mechanisms
