export interface StockDetectResult {
  isStock: boolean;
  ticker: string;
}

export interface StockData {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  marketCap: number;
  currency: string;
  name: string;
  ticker: string;
  exchange: string;
  chartData: Array<{ time: string; price: number | null }>;
}

export function detectStockIntent(query: string): StockDetectResult {
  const q = query.toLowerCase().trim();

  // Direct ticker: all caps 1-5 letters followed by stock/share/price
  const tickerMatch = query.match(
    /\b([A-Z]{1,5})\b(?=\s+stock|\s+share|\s+price|\s+trading)/
  );
  if (tickerMatch) {
    return { isStock: true, ticker: tickerMatch[1] };
  }

  // Company name to ticker mapping
  const companyMap: Record<string, string> = {
    apple: 'AAPL',
    tesla: 'TSLA',
    microsoft: 'MSFT',
    google: 'GOOGL',
    alphabet: 'GOOGL',
    amazon: 'AMZN',
    meta: 'META',
    facebook: 'META',
    nvidia: 'NVDA',
    netflix: 'NFLX',
    spotify: 'SPOT',
    uber: 'UBER',
    airbnb: 'ABNB',
    twitter: 'X',
    intel: 'INTC',
    amd: 'AMD',
    ibm: 'IBM',
    oracle: 'ORCL',
    salesforce: 'CRM',
    adobe: 'ADBE',
    stripe: 'STRIPE',
  };

  // Check if query contains company name and stock-related keywords
  for (const [name, ticker] of Object.entries(companyMap)) {
    if (
      q.includes(name) &&
      (q.includes('stock') ||
        q.includes('share') ||
        q.includes('price') ||
        q.includes('trading') ||
        q.includes('rate'))
    ) {
      return { isStock: true, ticker };
    }
  }

  return { isStock: false, ticker: '' };
}

export async function fetchStockData(ticker: string): Promise<StockData | null> {
  try {
    const res = await fetch(`/api/stock?ticker=${ticker}`, {
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) {
      console.error(`Stock fetch failed: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data as StockData;
  } catch (error) {
    console.error('Stock fetch error:', error);
    return null;
  }
}

export function isMarketOpen(): boolean {
  const now = new Date();
  // Convert to ET timezone
  const et = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/New_York' })
  );

  const day = et.getDay();
  const hours = et.getHours();
  const minutes = et.getMinutes();
  const time = hours * 60 + minutes;

  // NYSE/NASDAQ: 9:30 AM - 4:00 PM ET, Monday-Friday
  // 9:30 AM = 570 minutes, 4:00 PM = 960 minutes
  return day >= 1 && day <= 5 && time >= 570 && time <= 960;
}
