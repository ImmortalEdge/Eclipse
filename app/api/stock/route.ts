import { NextRequest, NextResponse } from 'next/server';

interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number;
        previousClose: number;
        marketCap: number;
        currency: string;
        longName: string;
        symbol: string;
        exchangeName: string;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          close: (number | null)[];
        }>;
      };
    }>;
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticker = (searchParams.get('ticker') || 'AAPL').toUpperCase();

    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}` +
      `?interval=1d&range=1mo`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Yahoo Finance returned ${res.status}` },
        { status: res.status }
      );
    }

    const data: YahooChartResponse = await res.json();

    if (!data.chart?.result?.[0]) {
      return NextResponse.json(
        { error: 'Invalid response from Yahoo Finance' },
        { status: 400 }
      );
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const prices = result.indicators.quote[0].close;
    const timestamps = result.timestamp;

    const change = meta.regularMarketPrice - meta.previousClose;
    const changePercent = (change / meta.previousClose) * 100;

    const chartData = timestamps
      .map((t, i) => ({
        time: new Date(t * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        price: prices[i] ? parseFloat(prices[i].toFixed(2)) : null
      }))
      .filter(d => d.price !== null);

    const response = {
      price: meta.regularMarketPrice,
      previousClose: meta.previousClose,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      marketCap: meta.marketCap,
      currency: meta.currency,
      name: meta.longName || ticker,
      ticker: meta.symbol,
      exchange: meta.exchangeName,
      chartData
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Stock API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
