import { NextRequest } from 'next/server';
import { StockService } from '@/lib/api/stockService';

export async function GET(req: NextRequest) {
  try {
    // Optionally, parse ?count= param
    const { searchParams } = new URL(req.url);
    const count = parseInt(searchParams.get('count') || '100', 10);
    const stocks = await StockService.getStockList(count);
    return new Response(JSON.stringify(stocks), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch stocks' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
