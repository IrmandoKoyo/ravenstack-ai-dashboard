// ============================================================
// Line Chart — MRR Trend (Monthly Recurring Revenue)
// ============================================================
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MonthlyMRR } from '../data/dataTypes';

interface Props {
  data: MonthlyMRR[];
}

export default function LineChartComponent({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No data available for selected filters</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#b45309" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#b45309" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          className="chart-axis"
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          className="chart-axis"
          tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{ 
            borderRadius: 12, 
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}
          itemStyle={{ color: 'var(--text-primary)', fontSize: '13px' }}
          labelStyle={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}
          formatter={(value) => [`$${Number(value).toLocaleString()}`, 'MRR']}
        />
        <Area
          type="monotone"
          dataKey="total_mrr"
          stroke="#b45309"
          strokeWidth={2.5}
          fill="url(#mrrGradient)"
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
