import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Panel, Pill, DataTable, LoadingSpinner, ErrorMessage } from '../components/UI';
import { fmtINR, fmtDate } from '../utils/format';

const TABS = ['all', 'active', 'completed', 'cancelled'];

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('all');
  const statusParam = activeTab === 'all' ? '' : `?status=${activeTab}`;
  const { data, loading, error } = useApi(`/investments${statusParam}`, [activeTab]);

  const rows = data?.investments || [];

  const columns = [
    { key: 'planDetails',         label: 'Plan',      render: v => <span style={{ fontWeight: '500' }}>{v?.name}</span> },
    { key: 'amount',              label: 'Amount',    render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtINR(v)}</span> },
    { key: 'dailyRoiPercentage',  label: 'Daily %',   render: v => <span style={{ color: 'var(--nx-gold)', fontFamily: 'var(--font-mono)' }}>{v}%</span> },
    { key: 'totalRoiPaid',        label: 'ROI Paid',  render: v => <span style={{ color: 'var(--nx-green)', fontFamily: 'var(--font-mono)' }}>{fmtINR(v)}</span> },
    { key: 'startDate',           label: 'Start',     render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-muted)', fontSize: '12px' }}>{fmtDate(v)}</span> },
    { key: 'endDate',             label: 'End',       render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-muted)', fontSize: '12px' }}>{fmtDate(v)}</span> },
    { key: 'status',              label: 'Status',    render: v => <Pill status={v} /> },
  ];

  return (
    <div>
      {error && <div style={{ marginBottom: '14px' }}><ErrorMessage message={error} /></div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'var(--nx-surface)', borderRadius: '8px', marginBottom: '16px', width: 'fit-content', border: '1px solid var(--nx-border)' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: '6px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500',
              color: activeTab === t ? 'var(--nx-blue)' : 'var(--nx-muted)',
              background: activeTab === t ? 'var(--nx-card)' : 'transparent',
              border: 'none', transition: 'all .15s', textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <Panel title="My Investments" badge={`${data?.total || 0} records`}>
          <DataTable columns={columns} rows={rows} emptyMessage="No investments found" />
        </Panel>
      )}
    </div>
  );
}
