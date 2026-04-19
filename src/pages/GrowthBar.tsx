// ============================================================
// Subscription Growth Bar Chart — Success Analytics
// ============================================================
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { MonthlyMRR } from '../data/dataTypes';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface Props {
  data: MonthlyMRR[];
}

export default function GrowthBar({ data }: Props) {
  const isNarrow = useMediaQuery('(max-width: 768px)');

  if (!data || data.length === 0) return <div className="chart-empty">No growth data available</div>;

  return (
    <ResponsiveContainer width="100%" height={isNarrow ? 340 : 320}>
      <BarChart 
        data={data} 
        margin={
          isNarrow
            ? { top: 8, right: 4, left: 0, bottom: 48 }
            : { top: 20, right: 30, left: 0, bottom: 0 }
        }
        barGap={0}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="chart-grid" />
        <XAxis 
          dataKey="label" 
          tick={{ fill: 'var(--text-secondary)', fontSize: isNarrow ? 10 : 11 }} 
          axisLine={false}
          tickLine={false}
          interval={isNarrow ? 0 : 'preserveStartEnd'}
          angle={isNarrow ? -40 : 0}
          textAnchor={isNarrow ? 'end' : 'middle'}
          height={isNarrow ? 52 : undefined}
        />
        <YAxis 
          tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          cursor={{ fill: 'var(--bg-hover)', opacity: 0.4 }}
          contentStyle={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '0', /* SHARP AS REQUESTED */
            border: '1px solid var(--border-color)', 
            color: 'var(--text-primary)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}
          itemStyle={{ fontSize: '12px', padding: '2px 0' }}
          labelStyle={{ fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}
        />
        <Legend 
          verticalAlign={isNarrow ? 'bottom' : 'top'} 
          align={isNarrow ? 'center' : 'right'} 
          iconType="rect"
          wrapperStyle={
            isNarrow
              ? { paddingTop: '12px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }
              : { paddingBottom: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }
          }
        />
        <Bar 
          name="New Subscriptions" 
          dataKey="new_subscriptions" 
          fill="var(--accent)" 
          radius={0} /* SHARP AS REQUESTED */
        />
        <Bar 
          name="Churned" 
          dataKey="churned_subscriptions" 
          fill="var(--text-muted)" 
          radius={0} /* SHARP AS REQUESTED */
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
