// ============================================================
// Pie Chart — Plan Tier Distribution
// ============================================================
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { PlanDistribution } from '../data/dataTypes';

interface Props {
  data: PlanDistribution[];
}

const COLORS: Record<string, string> = {
  'Basic': '#fcd34d',      /* Pale Gold */
  'Pro': '#f59e0b',        /* Amber */
  'Enterprise': '#b45309', /* Deep Bronze */
};

export default function PieChartComponent({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No data available for selected filters</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="count"
          nameKey="plan_tier"
          paddingAngle={3}
          animationDuration={1000}
          animationEasing="ease-out"
          label={(props: any) => `${props.plan_tier} (${props.percentage}%)`}
          labelLine={true}
        >
          {data.map((entry) => (
            <Cell
              key={entry.plan_tier}
              fill={COLORS[entry.plan_tier] || '#94a3b8'}
              strokeWidth={0}
            />
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
            const { percentage } = props.payload;
            return [`${value.toLocaleString()} (${percentage}%)`, 'Total'];
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
