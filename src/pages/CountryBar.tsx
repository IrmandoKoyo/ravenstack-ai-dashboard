// ============================================================
// Country Distribution Bar Chart
// ============================================================
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: { country: string, count: number }[];
}

const COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'];

export default function CountryBar({ data }: Props) {
  if (!data || data.length === 0) return <div className="chart-empty">No geography data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="chart-grid" />
        <XAxis 
          dataKey="country" 
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
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
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
          {data.map((_entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
