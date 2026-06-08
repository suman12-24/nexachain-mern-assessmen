import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { Panel, Pill, DataTable, LoadingSpinner, ErrorMessage, Button, Alert } from '../components/UI';
import { fmtINR, fmtDate } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ROIHistory() {
  const { authFetch } = useAuth();
  const { data, loading, error, refetch } = useApi('/roi-history');
  const [triggering, setTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState(null);

  const rows = data?.records || [];

  // Group records by date for the bar chart
  const chartMap = {};
  rows.forEach(r => {
    const d = fmtDate(r.date);
    chartMap[d] = (chartMap[d] || 0) + r.amount;
  });
  const chartData = Object.entries(chartMap)
    .slice(0, 14)
    .reverse()
    .map(([date, ROI]) => ({ date, ROI }));

  // Manually trigger today's ROI (dev/testing only)
  const handleTrigger = async () => {
    setTriggering(true);
    setTriggerResult(null);
    try {
      const res = await authFetch('/debug/trigger-roi', { method: 'POST' });
      if (!res.success) throw new Error(res.message);
      const { credited, skipped, errors } = res.result;
      setTriggerResult({
        type: credited > 0 ? 'success' : 'info',
        text: credited > 0
          ? `✓ ROI credited! ${credited} investment(s) processed. ${skipped > 0 ? `(${skipped} already credited today — skipped)` : ''}`
          : `Already credited today for all active investments. (Skipped: ${skipped})`,
      });
      // Refresh the table to show new records
      await refetch();
    } catch (err) {
      setTriggerResult({ type: 'error', text: err.message });
    } finally {
      setTriggering(false);
    }
  };

  const columns = [
    { key: 'date',       label: 'Date',      render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-muted)', fontSize: '12px' }}>{fmtDate(v)}</span> },
    { key: 'investment', label: 'Plan',       render: v => v?.planDetails?.name || '—' },
    { key: 'investment', label: 'Principal',  render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{fmtINR(v?.amount || 0)}</span> },
    { key: 'amount',     label: 'ROI Earned', render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-green)', fontWeight: '600' }}>+{fmtINR(v)}</span> },
    { key: 'status',     label: 'Status',     render: v => <Pill status={v} /> },
  ];

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Manual trigger panel */}
      <Panel
        title="ROI Processing"
        badge="Daily at 00:00 UTC"
        action={
          <Button onClick={handleTrigger} disabled={triggering} size="sm">
            {triggering ? '⟳ Processing...' : '▶ Trigger ROI Now'}
          </Button>
        }
      >
        <p style={{ fontSize: '13px', color: 'var(--nx-muted)', marginBottom: triggerResult ? '12px' : '0' }}>
          The cron job runs automatically every midnight. Use the button above to process ROI immediately for testing — it is safe to run multiple times (already-credited days are skipped automatically).
        </p>
        {triggerResult && <Alert type={triggerResult.type}>{triggerResult.text}</Alert>}
      </Panel>

      {/* Chart */}
      {chartData.length > 0 && (
        <Panel title="Daily ROI — Last 14 Days" badge="Bar chart">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.07)" />
              <XAxis dataKey="date" tick={{ fill: '#6b8caa', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b8caa', fontSize: 11 }} tickFormatter={v => '₹' + v} />
              <Tooltip
                contentStyle={{ background: 'var(--nx-card)', border: '1px solid var(--nx-border)', borderRadius: '8px', fontSize: '12px' }}
                formatter={v => [fmtINR(v), 'ROI']}
              />
              <Bar dataKey="ROI" fill="#f6c90e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {/* Credits table */}
      <Panel title="ROI Credit History" badge={`${data?.total || 0} records`}>
        <DataTable
          columns={columns}
          rows={rows}
          emptyMessage="No ROI credits yet. Click 'Trigger ROI Now' above to process today's ROI for your active investments."
        />
      </Panel>
    </div>
  );
}
