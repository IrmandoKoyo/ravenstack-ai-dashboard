import React from 'react';
import type { FeatureUsageSummary } from '../data/dataTypes';

interface Props {
  data: FeatureUsageSummary[];
}

export const FeatureTable: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No data available</div>;
  }

  // Sort by error rate descending, then by usage count
  const sortedData = [...data].sort((a, b) => {
    const errorRateA = a.total_usage_count > 0 ? a.total_errors / a.total_usage_count : 0;
    const errorRateB = b.total_usage_count > 0 ? b.total_errors / b.total_usage_count : 0;
    
    if (errorRateB !== errorRateA) return errorRateB - errorRateA;
    return b.total_usage_count - a.total_usage_count;
  });

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Feature Name</th>
            <th style={{ textAlign: 'right' }}>Total Usage</th>
            <th style={{ textAlign: 'right' }}>Adoption (Subs)</th>
            <th style={{ textAlign: 'right' }}>Total Errors</th>
            <th style={{ textAlign: 'right' }}>Error Rate</th>
            <th style={{ textAlign: 'right' }}>Avg Time/Session</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => {
            const errorRate = row.total_usage_count > 0 
              ? (row.total_errors / row.total_usage_count) * 100 
              : 0;

            let errorClass = '';
            if (errorRate > 5) errorClass = 'text-danger';
            else if (errorRate > 2) errorClass = 'text-warning';

            return (
              <tr key={row.feature_name}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{row.feature_name}</span>
                    {row.is_beta && (
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        backgroundColor: 'var(--accent)',
                        color: 'var(--bg-primary)',
                        borderRadius: '10px',
                        fontWeight: 'bold'
                      }}>
                        BETA
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>{row.total_usage_count.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>{row.unique_subscriptions.toLocaleString()}</td>
                <td style={{ textAlign: 'right', color: row.total_errors > 0 ? 'var(--danger)' : 'inherit' }}>
                  {row.total_errors.toLocaleString()}
                </td>
                <td style={{ textAlign: 'right' }} className={errorClass}>
                  {errorRate.toFixed(1)}%
                </td>
                <td style={{ textAlign: 'right' }}>{row.avg_usage_per_session}s</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
