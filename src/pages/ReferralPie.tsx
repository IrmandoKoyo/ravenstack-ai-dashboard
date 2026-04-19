// ============================================================
// Referral Source Pie Chart
// ============================================================
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: { source: string, count: number, percentage: number }[];
}

const COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#78350f'];

export default function ReferralPie({ data }: Props) {
  if (!data || data.length === 0) return <div className="chart-empty">No referral data</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={85}
          paddingAngle={5}
          dataKey="count"
          nameKey="source"
          label={(props: any) => `${props.source} (${props.percentage}%)`}
          labelLine={true}
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '12px', 
            border: '1px solid var(--border-color)', 
            color: 'var(--text-primary)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}
          itemStyle={{ color: 'var(--text-primary)', fontSize: '13px' }}
          labelStyle={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}
          formatter={(value: any, _name: any, props: any) => {
            const { percentage } = props.payload || {};
            return [`${value.toLocaleString()} (${percentage || 0}%)`, 'Count'];
          }}
        />
        <Legend verticalAlign="bottom" height={36}/>
      </PieChart>
    </ResponsiveContainer>
  );
}
