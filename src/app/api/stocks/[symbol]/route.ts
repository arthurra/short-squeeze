import { NextRequest } from 'next/server';
import { StockService } from '@/lib/api/stockService';

export async function GET(req: NextRequest, { params }: { params: { symbol: string } }) {
  const { symbol } = params;
  try {
    const stock = await StockService.getStockAnalysis(symbol);
    return new Response(JSON.stringify(stock), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch stock analysis' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
