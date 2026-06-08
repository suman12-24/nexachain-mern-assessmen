import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Panel, Button, FormField, Input, Alert } from '../components/UI';
import { fmtINR } from '../utils/format';
import { useNavigate } from 'react-router-dom';

const PLANS = {
  silver: { name: 'Silver Plan', roi: 1.0, days: 30, min: 100, max: 9999, color: 'var(--nx-muted)' },
  gold: { name: 'Gold Plan', roi: 1.5, days: 60, min: 10000, max: 49999, color: 'var(--nx-gold)' },
  diamond: { name: 'Diamond Plan', roi: 2.0, days: 90, min: 50000, max: 999999, color: 'var(--nx-blue)' },
};

export default function Invest() {
  const { authFetch } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('silver');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success'|'error', text }

  const plan = PLANS[selectedPlan];
  const amt = parseFloat(amount) || 0;
  const dailyRoi = amt > 0 ? (amt * plan.roi) / 100 : 0;
  const totalRoi = dailyRoi * plan.days;
  const maturityVal = amt + totalRoi;
  const navigate = useNavigate();
  const amountError =
    amt > 0 && (amt < plan.min || amt > plan.max)
      ? `Enter between ${fmtINR(plan.min)} and ${plan.max < 999999 ? fmtINR(plan.max) : 'unlimited'}`
      : null;

  const handleSubmit = async () => {
    if (!amount || amountError) return;
    setLoading(true); setResult(null);
    try {
      const res = await authFetch('/investments', {
        method: 'POST',
        body: JSON.stringify({ planKey: selectedPlan, amount: parseFloat(amount) }),
      });
      if (!res.success) throw new Error(res.message);
      setResult({ type: 'success', text: `✓ Investment of ${fmtINR(amount)} in ${plan.name} created successfully!` });
      setAmount('');
      setTimeout(() => {
        navigate('/portfolio');
      }, 1500); // 1.5 seconds
    } catch (err) {
      setResult({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px' }}>
      <Panel title="Create Investment" badge="Choose a Plan">

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '24px' }}>
          {Object.entries(PLANS).map(([key, p]) => {
            const selected = selectedPlan === key;
            return (
              <div
                key={key}
                onClick={() => { setSelectedPlan(key); setResult(null); }}
                style={{
                  border: `1px solid ${selected ? 'var(--nx-accent)' : 'var(--nx-border)'}`,
                  background: selected ? 'rgba(66,153,225,0.08)' : 'var(--nx-surface)',
                  borderRadius: '9px', padding: '16px', cursor: 'pointer', transition: 'all .15s',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '600', color: p.color, marginBottom: '6px' }}>{p.name}</div>
                <div style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--nx-gold)', lineHeight: 1 }}>{p.roi}%</div>
                <div style={{ fontSize: '12px', color: 'var(--nx-muted)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                  {fmtINR(p.min)} – {p.max < 999999 ? fmtINR(p.max) : 'Unlimited'} · {p.days} days
                </div>
              </div>
            );
          })}
        </div>

        {/* Amount input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormField label="Investment Amount (₹)" error={amountError} hint={`Min ${fmtINR(plan.min)}${plan.max < 999999 ? ' · Max ' + fmtINR(plan.max) : ''}`}>
            <Input
              type="number"
              placeholder={`e.g. ${fmtINR(plan.min).replace('₹', '')}`}
              value={amount}
              onChange={e => { setAmount(e.target.value); setResult(null); }}
              min={plan.min}
            />
          </FormField>

          {/* Projected returns */}
          <div style={{ background: 'var(--nx-surface)', border: '1px solid var(--nx-border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--nx-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
              Projected Returns
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              {[
                { label: 'Daily ROI', value: fmtINR(dailyRoi), color: 'var(--nx-gold)' },
                { label: `Total (${plan.days}d)`, value: fmtINR(totalRoi), color: 'var(--nx-green)' },
                { label: 'Maturity Value', value: fmtINR(maturityVal), color: 'var(--nx-blue)' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: '11px', color: 'var(--nx-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {result && <Alert type={result.type === 'success' ? 'success' : 'error'}>{result.text}</Alert>}

          <div>
            <Button onClick={handleSubmit} disabled={loading || !amount || !!amountError}>
              {loading ? 'Processing...' : '✓ Create Investment'}
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
