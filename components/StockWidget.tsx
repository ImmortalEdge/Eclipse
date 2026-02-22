'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { StockData, fetchStockData, isMarketOpen } from '@/lib/stock';

interface StockWidgetProps {
  ticker: string;
}

export default function StockWidget({ ticker }: StockWidgetProps) {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketOpen, setMarketOpen] = useState(false);

  useEffect(() => {
    const loadStockData = async () => {
      setLoading(true);
      setError(null);

      const stockData = await fetchStockData(ticker);

      if (stockData) {
        setData(stockData);
        setMarketOpen(isMarketOpen());
      } else {
        setError('Market data unavailable');
      }

      setLoading(false);
    };

    loadStockData();
  }, [ticker]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1714] border border-zinc-800 rounded-2xl p-5 mb-8 animate-pulse"
      >
        <div className="h-10 bg-zinc-800 rounded w-32 mb-4" />
        <div className="h-20 bg-zinc-800 rounded mb-4" />
        <div className="flex gap-3">
          <div className="h-8 bg-zinc-800 rounded flex-1" />
          <div className="h-8 bg-zinc-800 rounded flex-1" />
          <div className="h-8 bg-zinc-800 rounded flex-1" />
        </div>
      </motion.div>
    );
  }

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1714] border border-zinc-800 rounded-2xl p-5 mb-8"
      >
        <p className="text-zinc-500 italic text-sm">{error}</p>
        <p className="text-zinc-600 text-xs mt-2">Powered by Yahoo Finance</p>
      </motion.div>
    );
  }

  const isPositive = (data?.change ?? 0) >= 0;
  const chartColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1714] border border-zinc-800 rounded-2xl p-5 mb-8 shadow-2xl"
    >
      {/* Header: Company Info + Price */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3">
          {/* Company Logo / Avatar */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
            {data.ticker[0]}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white leading-tight">
              {data.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {data.ticker}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="text-xs text-zinc-500">
                {data.exchange}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  marketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Price Display */}
        <div className="text-right">
          <div className="text-2xl font-bold text-white font-sans tracking-tight">
            ${data?.price ? data.price.toLocaleString() : 'N/A'}
          </div>
          <div
            className={`flex items-center justify-end gap-1.5 text-xs font-semibold mt-1 ${
              isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {data?.change ? Math.abs(data.change).toFixed(2) : '0.00'}
            <span className="text-zinc-500 font-normal">
              ({data?.changePercent ? Math.abs(data.changePercent).toFixed(2) : '0.00'}%)
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      {data.chartData.length > 0 && (
        <div className="h-20 w-full mb-5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chartData}>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d0d0d',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                labelFormatter={(label) => new Date(label * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
            Market Cap
          </p>
          <p className="text-sm font-semibold text-zinc-200">
            {data.marketCap
              ? `$${(data.marketCap / 1e9).toFixed(2)}B`
              : 'N/A'}
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
            Range
          </p>
          <p className="text-sm font-semibold text-zinc-200">
            {data.chartData && data.chartData.length > 0
              ? (() => {
                  const prices = data.chartData
                    .map(d => d.price)
                    .filter((p): p is number => p !== null && p !== undefined);
                  if (prices.length === 0) return 'N/A';
                  const min = Math.min(...prices);
                  const max = Math.max(...prices);
                  return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
                })()
              : 'N/A'}
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
            Prev Close
          </p>
          <p className="text-sm font-semibold text-zinc-200">
            ${data?.previousClose ? data.previousClose.toFixed(2) : 'N/A'}
          </p>
        </div>
      </div>

      <p className="text-xs text-zinc-600 mt-4 text-right">
        Powered by Yahoo Finance
      </p>
    </motion.div>
  );
}
