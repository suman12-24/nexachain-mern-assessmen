import { useApi } from '../hooks/useApi';
import { StatCard, Panel, DataTable, LoadingSpinner, ErrorMessage } from '../components/UI';
import { fmtINR, fmtDate } from '../utils/format';

const TYPE_STYLE = {
  ROI:        { bg: 'rgba(246,201,14,0.12)',  color: '#f6c90e' },
  Referral:   { bg: 'rgba(79,209,197,0.12)',  color: '#4fd1c5' },
  Investment: { bg: 'rgba(252,129,129,0.12)', color: '#fc8181' },
};

export default function Wallet() {
  const { data: dashData, loading: dashLoading, error } = useApi('/dashboard');

  if (dashLoading) return <LoadingSpinner />;
  if (error)       return <ErrorMessage message={error} />;

  const db = dashData?.dashboard || {};

  // Build transaction log from ROI + referral history
  const roiTx = (db.recentRoi || []).map(r => ({
    date: r.date, type: 'ROI', desc: r.investment?.planDetails?.name || 'Investment ROI', amount: r.amount,
  }));
  const refTx = (db.recentReferralIncome || []).map(r => ({
    date: r.date, type: 'Referral', desc: `Level ${r.level} income from ${r.generator?.fullName || 'referral'}`, amount: r.amount,
  }));
  const transactions = [...roiTx, ...refTx].sort((a, b) => new Date(b.date) - new Date(a.date));

  const columns = [
    { key: 'date',   label: 'Date',        render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-muted)', fontSize: '12px' }}>{fmtDate(v)}</span> },
    { key: 'type',   label: 'Type',        render: v => { const s = TYPE_STYLE[v] || {}; return <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: s.bg, color: s.color, fontFamily: 'var(--font-mono)', fontWeight: '500' }}>{v}</span>; }},
    { key: 'desc',   label: 'Description', style: { color: 'var(--nx-muted)', fontSize: '13px' } },
    { key: 'amount', label: 'Amount',      render: v => <span style={{ fontFamily: 'var(--font-mono)', color: v > 0 ? 'var(--nx-green)' : 'var(--nx-red)', fontWeight: '600' }}>{v > 0 ? '+' : ''}{fmtINR(Math.abs(v))}</span> },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
        <StatCard label="Available Balance" value={fmtINR(db.walletBalance || 0)}            accentColor="var(--nx-green)" icon="👛" />
        <StatCard label="Total ROI Earned"  value={fmtINR(db.totalRoiEarned || 0)}           accentColor="var(--nx-gold)"  icon="📈" />
        <StatCard label="Referral Earned"   value={fmtINR(db.totalLevelIncomeEarned || 0)}   accentColor="var(--nx-teal)"  icon="👥" />
      </div>
      <Panel title="Recent Transactions">
        <DataTable columns={columns} rows={transactions} emptyMessage="No transactions yet. Start investing to see your earnings here." />
      </Panel>
    </div>
  );
}
