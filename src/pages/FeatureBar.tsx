// ============================================================
// Feature Usage Bar Chart — Product Analytics
// ============================================================
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { FeatureUsageSummary } from '../data/dataTypes';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface Props {
  data: FeatureUsageSummary[];
}

const COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'];

export default function FeatureBar({ data }: Props) {
  const isNarrow = useMediaQuery('(max-width: 768px)');
  // Take top 8 features for clarity
  const displayData = data.slice(0, 8);

  if (displayData.length === 0) {
    return (
      <div className="chart-empty">
        <p>No feature usage data available</p>
      </div>
    );
  }

  const chartMargin = isNarrow
    ? { top: 4, right: 8, left: 0, bottom: 4 }
    : { top: 5, right: 30, left: 40, bottom: 5 };
  const yAxisWidth = isNarrow ? 72 : 80;

  return (
    <ResponsiveContainer width="100%" height={isNarrow ? 280 : 300}>
      <BarChart 
        layout="vertical" 
        data={displayData} 
        margin={chartMargin}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="chart-grid" />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="feature_name" 
          type="category" 
          tick={{ fontSize: isNarrow ? 10 : 11, fill: 'var(--text-secondary)' }}
          width={yAxisWidth}
        />
        <Tooltip 
          cursor={{ fill: 'var(--bg-hover)' }}
          contentStyle={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '12px', 
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}
          itemStyle={{ color: 'var(--text-primary)', fontSize: '13px' }}
          labelStyle={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}
          formatter={(value: any) => [value.toLocaleString(), 'Total Usage']}
        />
        <Bar 
          dataKey="total_usage_count" 
          radius={[0, 4, 4, 0]}
          barSize={20}
        >
          {displayData.map((_entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
