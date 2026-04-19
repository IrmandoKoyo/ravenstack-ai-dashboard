// ============================================================
// Bar Chart — Revenue by Industry
// ============================================================
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { IndustryRevenue } from '../data/dataTypes';

interface Props {
  data: IndustryRevenue[];
}

const COLORS = ['#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fcd34d'];

export default function BarChartComponent({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No data available for selected filters</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
        <XAxis
          dataKey="industry"
          tick={{ fontSize: 11 }}
          className="chart-axis"
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
          formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Total MRR']}
        />
        <Bar
          dataKey="total_mrr"
          radius={[6, 6, 0, 0]}
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {data.map((_entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
