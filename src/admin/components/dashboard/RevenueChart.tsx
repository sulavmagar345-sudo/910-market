import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  ComposedChart,
} from 'recharts';
import { mockRevenueDataWeekly, mockRevenueDataMonthly, mockRevenueDataYearly } from '../../data/mock-dashboard';
import type { RevenueDataPoint } from '../../types';

type Period = 'weekly' | 'monthly' | 'yearly';

const periodData: Record<Period, RevenueDataPoint[]> = {
  weekly: mockRevenueDataWeekly,
  monthly: mockRevenueDataMonthly,
  yearly: mockRevenueDataYearly,
};

const periods: { key: Period; label: string }[] = [
  { key: 'weekly', label: 'This Week' },
  { key: 'monthly', label: 'This Year' },
  { key: 'yearly', label: 'All Years' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-semibold text-slate-800">
            {entry.name === 'Revenue'
              ? `रू ${Number(entry.value).toLocaleString()}`
              : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

interface RevenueChartProps {
  data?: RevenueDataPoint[]; // kept for backward compat, ignored
}

export function RevenueChart(_props: RevenueChartProps) {
  const [period, setPeriod] = useState<Period>('monthly');
  const data = periodData[period];

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 rounded-xl border border-slate-200 bg-white p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Revenue Overview</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Total: <span className="font-semibold text-admin-deep-forest">
              रू {totalRevenue.toLocaleString()}
            </span>
            {' · '}
            {totalOrders.toLocaleString()} orders
          </p>
        </div>

        {/* Period tabs */}
        <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-1">
          {periods.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={period}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="h-[240px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1F4D3A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1F4D3A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                dy={8}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickFormatter={(v) => `${v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${v/1000}k` : v}`}
                width={48}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#1F4D3A"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
              <Bar
                yAxisId="right"
                dataKey="orders"
                name="Orders"
                fill="#B88A2E"
                fillOpacity={0.25}
                radius={[3, 3, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-4 rounded-sm bg-admin-deep-forest opacity-70" />
          <span className="text-[11px] text-slate-500 font-medium">Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-4 rounded-sm bg-admin-luxury-gold opacity-50" />
          <span className="text-[11px] text-slate-500 font-medium">Orders</span>
        </div>
      </div>
    </div>
  );
}
