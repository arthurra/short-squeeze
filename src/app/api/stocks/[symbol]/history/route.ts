import { NextRequest } from 'next/server';
import { StockService } from '@/lib/api/stockService';

export async function GET(req: NextRequest, { params }: { params: { symbol: string } }) {
  const { symbol } = params;
  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  if (!start || !end) {
    return new Response(JSON.stringify({ error: 'Missing start or end date' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const result = await StockService.getHistoricalPrices(symbol, start, end);
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch historical prices' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
