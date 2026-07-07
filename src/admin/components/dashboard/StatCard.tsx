import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@admin/utils/cn';
import { useCountUp } from '../../hooks/useCountUp';

interface StatCardProps {
  title: string;
  value: string | number;
  rawValue?: number; // numeric value for count-up animation
  icon: React.ReactNode;
  iconBg?: string; // tailwind bg class
  trend?: number;
  trendLabel?: string;
  description?: string;
  sparkline?: number[];
  sparklineColor?: string;
  className?: string;
}

function SparklineChart({ data, color = '#1F4D3A' }: { data: number[]; color?: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={44}>
      <LineChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          strokeOpacity={0.7}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AnimatedValue({ rawValue, displayValue }: { rawValue?: number; displayValue: string | number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const count = useCountUp(rawValue ?? 0, 900, isInView);

  if (rawValue === undefined) {
    return <span ref={ref}>{displayValue}</span>;
  }

  // Format the count the same way as the display value
  const prefix = typeof displayValue === 'string' ? displayValue.replace(/[\d,.\s]+.*$/, '') : '';
  const suffix = typeof displayValue === 'string' ? displayValue.replace(/^[^\d]*[\d,.\s]+/, '') : '';

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatCard({
  title,
  value,
  rawValue,
  icon,
  iconBg = 'bg-admin-deep-forest/8',
  trend,
  trendLabel = 'vs last month',
  description,
  sparkline,
  sparklineColor,
  className,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.07)' }}
      transition={{ duration: 0.18 }}
      className={cn(
        'relative rounded-xl border border-slate-200 bg-white p-5 overflow-hidden',
        className
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', iconBg)}>
          <span className="h-4 w-4 text-admin-deep-forest [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        </div>

        {trend !== undefined && (
          <span className={cn(
            'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
            isPositive
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'
          )}>
            {isPositive
              ? <ArrowUpIcon className="h-2.5 w-2.5" />
              : <ArrowDownIcon className="h-2.5 w-2.5" />
            }
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mb-0.5">
        <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
          <AnimatedValue rawValue={rawValue} displayValue={value} />
        </p>
      </div>

      {/* Title */}
      <p className="text-xs font-medium text-slate-500">{title}</p>

      {/* Trend label */}
      {trend !== undefined && (
        <p className="text-[10px] text-slate-400 mt-0.5">
          <span className={isPositive ? 'text-emerald-600' : 'text-red-500'}>
            {isPositive ? '+' : ''}{trend}%
          </span>{' '}
          {trendLabel}
        </p>
      )}

      {description && (
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      )}

      {/* Sparkline */}
      {sparkline && sparkline.length > 0 && (
        <div className="mt-3 -mx-1">
          <SparklineChart data={sparkline} color={sparklineColor} />
        </div>
      )}
    </motion.div>
  );
}
