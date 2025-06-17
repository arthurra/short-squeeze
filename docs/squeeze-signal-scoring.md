# Squeeze Signal Scoring System Documentation

## Overview

The squeeze signal scoring system provides a comprehensive 0-100 score that indicates the likelihood of a potential short squeeze for a given stock. The score is calculated by combining multiple weighted factors that contribute to squeeze potential.

## Input Parameters

### Required Data

```typescript
interface SqueezeSignalInput {
  currentVolume: number; // Current trading volume
  priceHistory: PriceDataPoint[]; // Historical price data points
  shortInterestPercent: number; // Current short interest as percentage
  marketCap: number; // Market capitalization in USD
  avgVolume: number; // Average trading volume
  recentFilings: SECFiling[]; // Recent SEC filings
  recentNews: NewsArticle[]; // Recent news articles
  recentSocialPosts: SocialMediaPost[]; // Recent social media posts
}
```

## Component Scores

### 1. Volume Score (0-30 points, 25% weight)

- Compares current volume to average volume
- Considers volume trend over time
- Maximum score achieved at 10x average volume
- Formula: `min(30, (currentVolume / avgVolume) * 3)`

### 2. Short Interest Score (0-40 points, 25% weight)

- Based on short interest percentage
- Adjusted for market cap and average volume
- Higher scores for stocks with:
  - Short interest > 30%
  - Lower market cap
  - Higher average volume
- Formula: `min(40, shortInterestPercent * 1.33)`

### 3. Trading Flow Score (0-15 points, 15% weight)

- Analyzes price and volume patterns
- Considers:
  - Price momentum
  - Volume distribution
  - Trading patterns
- Maximum score for strong upward momentum with increasing volume

### 4. SEC Filing Score (0-15 points, 10% weight)

- Evaluates recent SEC filings
- Higher scores for:
  - Recent 8-K filings (material events)
  - Form 4 filings (insider trading)
  - Form 13F filings (institutional positions)
- Time decay applied over 5 days

### 5. News Coverage Score (0-15 points, 15% weight)

- Analyzes recent news articles
- Factors considered:
  - Article sentiment (positive/negative/neutral)
  - Source credibility
  - Publication recency
  - Article relevance
- Time decay applied over 3 days

### 6. Social Media Buzz Score (0-15 points, 10% weight)

- Evaluates social media activity across platforms
- Platform weights:
  - Reddit: 40%
  - Twitter: 35%
  - StockTwits: 25%
- Engagement metrics:
  - Likes
  - Comments
  - Shares
- Additional factors:
  - Sentiment (bullish/bearish/neutral)
  - Verified user status
  - Post recency
- Time decay applied over 3 days

## Final Score Calculation

1. Calculate individual component scores
2. Apply component weights:

   ```typescript
   const weights = {
     volume: 0.25, // 25%
     shortInterest: 0.25, // 25%
     tradingFlow: 0.15, // 15%
     secFiling: 0.1, // 10%
     news: 0.15, // 15%
     socialBuzz: 0.1, // 10%
   };
   ```

3. Calculate weighted sum:

   ```typescript
   const weightedSum =
     volumeScore * weights.volume +
     shortInterestScore * weights.shortInterest +
     tradingFlowScore * weights.tradingFlow +
     secFilingScore * weights.secFiling +
     newsScore * weights.news +
     socialBuzzScore * weights.socialBuzz;
   ```

4. Normalize to 0-100 scale:

   ```typescript
   const maxPossibleScore =
     30 * weights.volume + // Volume score max: 30
     40 * weights.shortInterest + // Short interest score max: 40
     15 * weights.tradingFlow + // Trading flow score max: 15
     15 * weights.secFiling + // SEC filing score max: 15
     15 * weights.news + // News score max: 15
     15 * weights.socialBuzz; // Social buzz score max: 15

   const normalizedScore = (weightedSum / maxPossibleScore) * 100;
   ```

## Score Interpretation

- 0-20: Low squeeze potential
- 21-40: Moderate squeeze potential
- 41-60: High squeeze potential
- 61-80: Very high squeeze potential
- 81-100: Extreme squeeze potential

## Time Decay

All time-sensitive components (SEC filings, news, social media) use a linear time decay function:

```typescript
const timeDecay = (timestamp: number) => {
  const hoursAgo = (Date.now() - timestamp) / (1000 * 60 * 60);
  return Math.max(0, 1 - hoursAgo / 72); // 72 hours = 3 days
};
```

## Usage Example

```typescript
const score = calculateSqueezeSignal({
  currentVolume: 1000000,
  priceHistory: [...],
  shortInterestPercent: 30,
  marketCap: 100000000,
  avgVolume: 500000,
  recentFilings: [...],
  recentNews: [...],
  recentSocialPosts: [...]
});

console.log(`Squeeze Signal Score: ${score}`); // Output: 75
```

## Best Practices

1. Update scores frequently (at least daily)
2. Consider market conditions when interpreting scores
3. Use scores in conjunction with other analysis tools
4. Monitor score changes over time
5. Set appropriate thresholds for alerts/notifications

## Limitations

1. Historical data dependency
2. Market condition sensitivity
3. Social media data reliability
4. News sentiment accuracy
5. Time delay in data availability
