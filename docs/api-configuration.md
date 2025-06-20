# API Configuration Guide

This guide explains how to configure the Short Squeeze Dashboard to use real API data instead of mock data.

## Quick Setup

### Option 1: Automated Setup (Recommended)

Run the setup script to configure your environment:

```bash
npm run setup
```

This will:

- Create a `.env.local` file
- Ask if you want to use real API data
- Configure the necessary environment variables

### Option 2: Manual Setup

1. Create a `.env.local` file in the project root:

```env
# Polygon.io API Key (required for real stock data)
# Get your free API key at https://polygon.io/
POLYGON_API_KEY=your_api_key_here

# Set to false to use real API data instead of mock data
USE_MOCK_DATA=false

# API Configuration (optional)
API_RATE_LIMIT=5
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000
CACHE_TTL=300
```

2. Get a free Polygon.io API key at [https://polygon.io/](https://polygon.io/)

3. Replace `your_api_key_here` with your actual API key

## Environment Variables

| Variable             | Description                       | Default | Required            |
| -------------------- | --------------------------------- | ------- | ------------------- |
| `POLYGON_API_KEY`    | Your Polygon.io API key           | -       | Yes (for real data) |
| `USE_MOCK_DATA`      | Use mock data instead of real API | `true`  | No                  |
| `API_RATE_LIMIT`     | API requests per second           | `5`     | No                  |
| `API_RETRY_ATTEMPTS` | Number of retry attempts          | `3`     | No                  |
| `API_RETRY_DELAY`    | Delay between retries (ms)        | `1000`  | No                  |
| `CACHE_TTL`          | Cache time-to-live (seconds)      | `300`   | No                  |

## Switching Between Mock and Real Data

### Using Mock Data (Default)

```env
USE_MOCK_DATA=true
# POLYGON_API_KEY not required
```

**Pros:**

- No API key required
- Fast development and testing
- No rate limits
- Realistic sample data

**Cons:**

- Not real-time data
- Limited to predefined symbols
- No market updates

### Using Real API Data

```env
USE_MOCK_DATA=false
POLYGON_API_KEY=your_api_key_here
```

**Pros:**

- Real-time market data
- Access to all available stocks
- Live price updates
- Historical data

**Cons:**

- Requires API key
- Rate limited by API plan
- Potential API costs

## API Data Sources

The app uses Polygon.io for the following data:

### Stock Quotes

- Real-time price data
- Volume information
- Price changes and percentages

### Stock Details

- Company information
- Market capitalization
- Sector and industry classification

### Historical Data

- Price history for charts
- OHLC (Open, High, Low, Close) data
- Volume history

## Rate Limits and Costs

### Polygon.io Free Tier

- 5 API calls per minute
- Basic stock data
- Limited historical data

### Polygon.io Paid Tiers

- Higher rate limits
- More comprehensive data
- Real-time streaming

## Troubleshooting

### Common Issues

1. **"Missing required environment variable: POLYGON_API_KEY"**

   - Make sure you've set `POLYGON_API_KEY` in your `.env.local` file
   - Ensure the API key is valid

2. **"API rate limit exceeded"**

   - Reduce `API_RATE_LIMIT` in your configuration
   - Upgrade your Polygon.io plan
   - Switch back to mock data temporarily

3. **"Failed to fetch stocks"**
   - Check your internet connection
   - Verify your API key is valid
   - Check Polygon.io service status

### Debug Mode

To see detailed API logs, add this to your `.env.local`:

```env
NODE_ENV=development
DEBUG=stock-service:*
```

## Development Workflow

### Recommended Development Setup

1. **Start with mock data** for initial development
2. **Switch to real data** for testing API integration
3. **Use both** for comprehensive testing

### Environment Switching

You can easily switch between environments:

```bash
# Use mock data
export USE_MOCK_DATA=true

# Use real data
export USE_MOCK_DATA=false
export POLYGON_API_KEY=your_key

# Restart the development server
npm run dev
```

## Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for configuration
3. **Test with both mock and real data**
4. **Monitor API usage** to avoid rate limits
5. **Cache data appropriately** to reduce API calls

## Support

If you encounter issues:

1. Check the [Polygon.io documentation](https://polygon.io/docs/)
2. Review the app's error logs
3. Verify your API key permissions
4. Test with mock data first
