import { useApi } from '../hooks/useApi';
import { StatCard, Panel, Pill, LoadingSpinner, ErrorMessage, DataTable } from '../components/UI';
import { fmtINR, fmtDate } from '../utils/format';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#63b3ed', '#f6c90e', '#4fd1c5', '#9f7aea'];

const customTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--nx-card)', border: '1px solid var(--nx-border)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ color: 'var(--nx-muted)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {fmtINR(p.value)}</div>)}
    </div>
  );
};

export default function Dashboard() {
  const { data, loading, error } = useApi('/dashboard');
  const { data: invData,  loading: invLoading  } = useApi('/investments?limit=5');
  const { data: roiData,  loading: roiLoading  } = useApi('/roi-history?limit=10');
  const { data: refData,  loading: refLoading  } = useApi('/referrals/income?limit=10');

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error)   return <ErrorMessage message={error} />;

  const db = data?.dashboard;
  if (!db) return <ErrorMessage message="No data available" />;

  // Chart data from recent ROI + referral history
  const chartData = (db.recentRoi || []).map((r, i) => ({
    date: fmtDate(r.date),
    ROI: r.amount,
    Referral: db.recentReferralIncome?.[i]?.amount || 0,
  })).reverse();

  const pieData = db.investments?.totalInvested > 0
    ? [{ name: 'Invested', value: db.investments.totalInvested }]
    : [];

  // ── Investment History columns ──────────────────────────────────────────────
  const invColumns = [
    { key: 'planDetails',        label: 'Plan',    render: v => <span style={{ fontWeight: '500' }}>{v?.name}</span> },
    { key: 'amount',             label: 'Amount',  render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtINR(v)}</span> },
    { key: 'dailyRoiPercentage', label: 'ROI/Day', render: v => <span style={{ color: 'var(--nx-gold)', fontFamily: 'var(--font-mono)' }}>{v}%</span> },
    { key: 'totalRoiPaid',       label: 'Earned',  render: v => <span style={{ color: 'var(--nx-green)', fontFamily: 'var(--font-mono)' }}>{fmtINR(v)}</span> },
    { key: 'startDate',          label: 'Start',   render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-muted)', fontSize: '12px' }}>{fmtDate(v)}</span> },
    { key: 'endDate',            label: 'End',     render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-muted)', fontSize: '12px' }}>{fmtDate(v)}</span> },
    { key: 'status',             label: 'Status',  render: v => <Pill status={v} /> },
  ];

  // ── ROI History columns ─────────────────────────────────────────────────────
  const roiColumns = [
    { key: 'date',       label: 'Date',   render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-muted)', fontSize: '12px' }}>{fmtDate(v)}</span> },
    { key: 'investment', label: 'Plan',   render: v => v?.planDetails?.name || '—' },
    { key: 'amount',     label: 'ROI',    render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-green)', fontWeight: '600' }}>+{fmtINR(v)}</span> },
    { key: 'status',     label: 'Status', render: v => <Pill status={v} /> },
  ];

  // ── Referral Income History columns ────────────────────────────────────────
  const refColumns = [
    { key: 'generator', label: 'From',   render: v => <span style={{ fontWeight: '500' }}>{v?.fullName || '—'}</span> },
    { key: 'level',     label: 'Level',  render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-blue)', fontWeight: '600' }}>L{v}</span> },
    { key: 'amount',    label: 'Income', render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-green)', fontWeight: '600' }}>+{fmtINR(v)}</span> },
    { key: 'date',      label: 'Date',   render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-muted)', fontSize: '12px' }}>{fmtDate(v)}</span> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
        <StatCard label="Total Invested"  value={fmtINR(db.investments?.totalInvested || 0)} delta={`${db.investments?.active || 0} active plans`} deltaUp accentColor="var(--nx-blue)"  icon="💰" />
        <StatCard label="Daily ROI"       value={fmtINR(db.recentRoi?.[0]?.amount || 0)}     delta="today's credit"  deltaUp accentColor="var(--nx-gold)"  icon="📈" />
        <StatCard label="Level Income"    value={fmtINR(db.totalLevelIncomeEarned || 0)}      delta="all time"        deltaUp accentColor="var(--nx-teal)"  icon="👥" />
        <StatCard label="Wallet Balance"  value={fmtINR(db.walletBalance || 0)}               delta="available"       deltaUp accentColor="var(--nx-green)" icon="👛" />
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '14px' }}>
        <Panel title="Earnings — Last 7 Days" badge="ROI + Referral">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.07)" />
                <XAxis dataKey="date" tick={{ fill: '#6b8caa', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b8caa', fontSize: 11 }} tickFormatter={v => '₹' + v} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }} />
                <Line type="monotone" dataKey="ROI"      stroke="#f6c90e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Referral" stroke="#4fd1c5" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nx-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
              No earnings yet — create your first investment!
            </div>
          )}
        </Panel>

        <Panel title="Portfolio Split" badge="by Plan">
          {db.investments?.totalInvested > 0 ? (
            <>
              <PieChart width={180} height={140} style={{ margin: '0 auto' }}>
                <Pie data={pieData} cx={90} cy={70} innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmtINR(v)} contentStyle={{ background: 'var(--nx-card)', border: '1px solid var(--nx-border)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px', fontSize: '12px' }}>
                <div style={{ background: 'var(--nx-surface)', borderRadius: '6px', padding: '8px 10px' }}>
                  <div style={{ color: 'var(--nx-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>Active Plans</div>
                  <div style={{ fontWeight: '700', color: 'var(--nx-blue)' }}>{db.investments?.active || 0}</div>
                </div>
                <div style={{ background: 'var(--nx-surface)', borderRadius: '6px', padding: '8px 10px' }}>
                  <div style={{ color: 'var(--nx-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>Completed</div>
                  <div style={{ fontWeight: '700', color: 'var(--nx-teal)' }}>{db.investments?.completed || 0}</div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nx-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
              No active investments
            </div>
          )}
        </Panel>
      </div>

      {/* ── Investment History Table ────────────────────────────────────────── */}
      <Panel title="Investment History" badge="Recent 5">
        {invLoading ? <LoadingSpinner /> : (
          <DataTable
            columns={invColumns}
            rows={invData?.investments || []}
            emptyMessage="No investments yet. Go to Invest to create your first plan."
          />
        )}
      </Panel>

      {/* ── ROI History Table ───────────────────────────────────────────────── */}
      <Panel title="ROI History" badge="Recent credits">
        {roiLoading ? <LoadingSpinner /> : (
          <DataTable
            columns={roiColumns}
            rows={roiData?.records || []}
            emptyMessage="No ROI credits yet. ROI is credited daily at midnight for active investments."
          />
        )}
      </Panel>

      {/* ── Referral Income History Table ───────────────────────────────────── */}
      <Panel title="Referral Income History" badge="Level income">
        {refLoading ? <LoadingSpinner /> : (
          <DataTable
            columns={refColumns}
            rows={refData?.records || []}
            emptyMessage="No referral income yet. Share your referral link so your network can invest."
          />
        )}
      </Panel>

    </div>
  );
}
