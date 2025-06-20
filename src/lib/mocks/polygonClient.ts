export const mockPolygonClient = {
  stocks: {
    dailyOpenClose: jest.fn().mockResolvedValue({
      open: 10,
      high: 15,
      low: 8,
      close: 12,
      volume: 1000000,
    }),
    previousClose: jest.fn().mockResolvedValue({
      results: {
        c: 10,
        h: 15,
        l: 8,
        o: 9,
        v: 1000000,
      },
    }),
    aggregates: jest.fn().mockResolvedValue({
      results: [
        { c: 10, h: 15, l: 8, o: 9, v: 1000000, t: Date.now() },
        { c: 11, h: 16, l: 9, o: 10, v: 1200000, t: Date.now() - 86400000 },
      ],
    }),
  },
  reference: {
    tickers: jest.fn().mockResolvedValue({
      results: [
        {
          ticker: 'AAPL',
          name: 'Apple Inc.',
          market: 'stocks',
          type: 'CS',
          currency: 'USD',
          active: true,
        },
      ],
    }),
  },
};

jest.mock('@polygon.io/client-js', () => ({
  createClient: () => mockPolygonClient,
}));
