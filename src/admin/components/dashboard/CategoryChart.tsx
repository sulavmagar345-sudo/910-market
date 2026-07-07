import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { mockCategoryData } from '../../data/mock-dashboard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-800">{d.name}</p>
      <p className="text-slate-500 mt-0.5">रू {d.revenue.toLocaleString()}</p>
      <p className="text-slate-500">{d.value}% of sales</p>
    </div>
  );
}

export function CategoryChart() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Sales by Category</h3>
        <p className="text-xs text-slate-500 mt-0.5">Revenue distribution this period</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-[140px] w-[140px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={65}
                dataKey="value"
                strokeWidth={2}
                stroke="white"
              >
                {mockCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {mockCategoryData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-medium text-slate-600 flex-1 truncate">{item.name}</span>
              <span className="text-xs font-semibold text-slate-800 tabular-nums">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
