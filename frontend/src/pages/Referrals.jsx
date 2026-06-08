import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { Panel, DataTable, LoadingSpinner, ErrorMessage, Alert, Button } from '../components/UI';
import { fmtINR, fmtDate, initials } from '../utils/format';

const AVATAR_COLORS = ['#4299e1', '#4fd1c5', '#f6c90e', '#68d391', '#ed8936', '#9f7aea'];

function TreeNode({ node }) {
  const [open, setOpen] = useState(true);
  const color = AVATAR_COLORS[node.level % AVATAR_COLORS.length];
  const hasChildren = node.children?.length > 0;

  return (
    <div style={{ paddingLeft: node.level === 0 ? 0 : '20px', borderLeft: node.level === 0 ? 'none' : '1px solid var(--nx-border)', marginLeft: node.level === 0 ? 0 : '12px', paddingTop: node.level === 0 ? 0 : '6px' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(99,179,237,0.04)', border: '1px solid var(--nx-border)', borderRadius: '8px', padding: '9px 12px', marginBottom: '6px', cursor: hasChildren ? 'pointer' : 'default' }}
        onClick={() => hasChildren && setOpen(o => !o)}
      >
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${color}20`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
          {initials(node.fullName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.fullName}</div>
          {node.email && <div style={{ fontSize: '11px', color: 'var(--nx-muted)', fontFamily: 'var(--font-mono)' }}>{node.email}</div>}
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--nx-muted)', flexShrink: 0 }}>L{node.level}</span>
        {node.accountStatus && (
          <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: node.accountStatus === 'active' ? 'rgba(104,211,145,0.12)' : 'rgba(252,129,129,0.12)', color: node.accountStatus === 'active' ? 'var(--nx-green)' : 'var(--nx-red)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
            {node.accountStatus}
          </span>
        )}
        {hasChildren && <span style={{ fontSize: '11px', color: 'var(--nx-muted)' }}>{open ? '▲' : '▼'}</span>}
      </div>
      {open && hasChildren && node.children.map((child, i) => <TreeNode key={i} node={child} />)}
    </div>
  );
}

export default function Referrals() {
  const { user } = useAuth();
  const { data: treeData,   loading: treeLoading,   error: treeError   } = useApi('/referrals/tree');
  const { data: incomeData, loading: incomeLoading, error: incomeError } = useApi('/referrals/income');
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join NexaChain AI', text: 'Invest & earn daily ROI!', url: referralLink });
    } else {
      copyLink();
    }
  };

  const incomeColumns = [
    { key: 'generator', label: 'From',   render: v => <span style={{ fontWeight: '500' }}>{v?.fullName || '—'}</span> },
    { key: 'level',     label: 'Level',  render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-blue)', fontWeight: '600' }}>L{v}</span> },
    { key: 'amount',    label: 'Amount', render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-green)', fontWeight: '600' }}>+{fmtINR(v)}</span> },
    { key: 'date',      label: 'Date',   render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nx-muted)', fontSize: '12px' }}>{fmtDate(v)}</span> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Referral share card */}
      <Panel title="Your Referral Link" badge={`Code: ${user?.referralCode}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--nx-muted)' }}>
            Share your referral link and earn level income when your network invests. You earn up to <strong style={{ color: 'var(--nx-gold)' }}>5 levels</strong> deep.
          </div>

          {/* Level income table */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            {[['L1','5%'],['L2','3%'],['L3','2%'],['L4','1%'],['L5','0.5%']].map(([l, p]) => (
              <div key={l} style={{ background: 'var(--nx-surface)', border: '1px solid var(--nx-border)', borderRadius: '6px', padding: '6px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--nx-muted)', fontFamily: 'var(--font-mono)' }}>{l}</div>
                <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--nx-gold)' }}>{p}</div>
              </div>
            ))}
          </div>

          {/* Link box */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
            <div style={{ flex: 1, background: 'var(--nx-surface)', border: '1px solid var(--nx-border)', borderRadius: '8px', padding: '9px 13px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--nx-blue)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {referralLink}
            </div>
            <Button onClick={copyLink} variant="ghost" size="sm">{copied ? '✓ Copied!' : '⎘ Copy'}</Button>
            <Button onClick={shareLink} size="sm">↗ Share</Button>
          </div>

          {copied && <Alert type="success">Link copied to clipboard!</Alert>}
        </div>
      </Panel>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Tree */}
        <Panel title="Referral Hierarchy" badge="Up to 5 levels">
          {treeError  && <ErrorMessage message={treeError} />}
          {treeLoading ? <LoadingSpinner /> : (
            treeData?.tree
              ? <TreeNode node={treeData.tree} />
              : <div style={{ textAlign: 'center', padding: '32px', color: 'var(--nx-muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>No referrals yet</div>
          )}
        </Panel>

        {/* Income log */}
        <Panel title="Level Income Log">
          {incomeError  && <ErrorMessage message={incomeError} />}
          {incomeLoading ? <LoadingSpinner /> : (
            <DataTable
              columns={incomeColumns}
              rows={incomeData?.records || []}
              emptyMessage="No referral income yet"
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
