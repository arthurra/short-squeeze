# Penny Stock Insights Dashboard PRD

## Introduction/Overview

The Penny Stock Insights Dashboard is an informational tool designed to help novice traders identify and analyze potential penny stock opportunities. The dashboard provides a curated view of stocks meeting specific criteria ($1-$5 price range, $20M-$300M market cap) and presents key metrics and signals in an easy-to-understand format. This feature aims to democratize access to penny stock analysis by presenting complex trading signals in a digestible format for beginners.

## Goals

1. Help novice traders identify promising penny stock opportunities
2. Present complex trading signals in an easily digestible format
3. Provide daily updated insights on potential stock movements
4. Reduce the learning curve for penny stock trading analysis
5. Create a reliable source of penny stock information

## User Stories

1. As a novice trader, I want to see a list of penny stocks that meet my basic criteria so I can focus on potential opportunities
2. As a day trader, I want to quickly identify stocks with high short interest and volume spikes so I can spot potential squeeze opportunities
3. As a monthly trader, I want to see 30-day performance trends so I can identify stocks with consistent growth
4. As a risk-averse trader, I want to filter out stocks with high dilution risk so I can avoid potentially dangerous investments
5. As a busy trader, I want to see key metrics at a glance so I can make quick decisions

## Functional Requirements

### 1. Stock Universe Filtering

1.1. The system must filter stocks based on the following criteria:

- Price per share: $1.00 to $5.00
- Market cap: $20M to $300M
- U.S. exchanges only (with optional OTC inclusion)
- No recent reverse splits (configurable threshold)

### 2. Monthly Gainers Dashboard

2.1. The system must display a list of top performing stocks based on 30-day percentage gain
2.2. Each stock entry must show:

- Ticker symbol and company name
- Current price
- 30-day percentage change
- 30-day price sparkline
- Squeeze Signal Score (0-100)
  2.3. The system must allow tapping/clicking on any stock to view detailed analysis

### 3. Squeeze Signal Score Calculation

3.1. The system must calculate a score (0-100) based on:

- Current volume vs average volume
- Short interest percentage
- Trading flow metrics
- SEC filing presence
- News report presence
- Social media buzz metrics

### 4. Filtering Capabilities

4.1. The system must allow filtering by:

- Volume spike threshold
- Minimum short interest percentage
- Sector or industry
- Dilution risk level

### 5. Data Management

5.1. The system must update data daily
5.2. The system must maintain one month of historical data
5.3. The system must integrate with Yahoo Finance or Polygon.io APIs

## Non-Goals (Out of Scope)

1. Direct trading functionality
2. Real-time price updates
3. Portfolio management
4. Advanced technical analysis tools
5. Automated trading signals
6. User account management
7. Social trading features

## Design Considerations

1. Follow Nielsen Norman Group guidelines for:
   - Information hierarchy
   - Visual clarity
   - Mobile responsiveness
   - Accessibility standards
2. Implement a clean, modern interface with:
   - Clear typography
   - Intuitive navigation
   - Consistent color coding for positive/negative values
   - Responsive sparkline charts
3. Support both light and dark modes
4. Ensure mobile-first design approach

## Technical Considerations

1. Data Integration:

   - Implement robust error handling for API failures
   - Cache data to handle API rate limits
   - Implement fallback data sources

2. Performance Requirements:

   - Page load time < 2 seconds
   - Daily data refresh during off-market hours
   - Efficient data storage and retrieval

3. Security:
   - Implement rate limiting
   - Secure API key management
   - Data validation and sanitization

## Success Metrics

1. User Engagement:

   - Daily active users
   - Average session duration
   - Number of stock detail views

2. Feature Usage:

   - Filter usage statistics
   - Most viewed stocks
   - Popular filter combinations

3. Data Quality:
   - API uptime
   - Data accuracy
   - Update success rate

## Open Questions

1. Should we implement user preferences for default filters?
2. How should we handle stocks that move outside the price range during the day?
3. What is the optimal time for daily data updates?
4. Should we implement any form of user feedback mechanism?
5. How should we handle stocks that get delisted or suspended?

## Implementation Phases

### Phase 1: Core Dashboard

- Basic stock listing
- Essential filters
- Simple sparkline implementation
- Basic squeeze signal calculation

### Phase 2: Enhanced Features

- Advanced filtering
- Detailed stock analysis view
- Improved signal calculation
- Historical data visualization

### Phase 3: Optimization

- Performance improvements
- UI/UX refinements
- Additional data sources
- Enhanced error handling
