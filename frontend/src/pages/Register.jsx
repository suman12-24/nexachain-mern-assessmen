import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Alert } from '../components/UI';
import {
  validateIndianMobile,
  validatePassword,
  getPasswordStrengthRules,
  getPasswordScore,
} from '../utils/validators';

// ── Password strength bar ─────────────────────────────────────────────────────
const SCORE_CONFIG = [
  { label: 'Too weak',  color: '#fc8181' },
  { label: 'Weak',      color: '#fc8181' },
  { label: 'Fair',      color: '#f6c90e' },
  { label: 'Good',      color: '#4fd1c5' },
  { label: 'Strong',    color: '#68d391' },
];

function PasswordStrengthMeter({ password }) {
  const score   = getPasswordScore(password);
  const rules   = getPasswordStrengthRules(password);
  const config  = SCORE_CONFIG[score];
  if (!password) return null;

  return (
    <div style={{ marginTop: '8px' }}>
      {/* Bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: i <= score ? config.color : 'rgba(99,179,237,0.12)',
            transition: 'background .25s',
          }} />
        ))}
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: config.color, marginLeft: '6px', whiteSpace: 'nowrap' }}>
          {config.label}
        </span>
      </div>
      {/* Rule checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {rules.map(r => (
          <div key={r.rule} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: r.passed ? 'var(--nx-green)' : 'var(--nx-muted)' }}>
            <span style={{ fontSize: '10px' }}>{r.passed ? '✓' : '○'}</span>
            {r.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shared input style ────────────────────────────────────────────────────────
const inputBase = (hasError) => ({
  width: '100%', background: 'var(--nx-surface)',
  border: `1px solid ${hasError ? 'rgba(252,129,129,0.6)' : 'var(--nx-border)'}`,
  borderRadius: '8px', padding: '9px 13px', color: 'var(--nx-text)',
  fontSize: '14px', outline: 'none', transition: 'border-color .15s',
});

const labelStyle = {
  display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--nx-muted)',
  letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '6px',
};

// ── Main component ────────────────────────────────────────────────────────────
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '', password: '', confirmPassword: '',
    referralCode: params.get('ref') || '',
  });
  const [touched, setTouched]     = useState({});
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]     = useState(false);

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    setServerError('');
  };
  const touch = (key) => () => setTouched(t => ({ ...t, [key]: true }));

  // ── Per-field errors (only shown after field is touched) ──────────────────
  const errors = {
    fullName:        touched.fullName && !form.fullName.trim()            ? 'Full name is required' : null,
    email:           touched.email    && !/^\S+@\S+\.\S+$/.test(form.email) ? 'Enter a valid email address' : null,
    mobile:          touched.mobile   ? validateIndianMobile(form.mobile) : null,
    password:        touched.password ? validatePassword(form.password)   : null,
    confirmPassword: touched.confirmPassword && form.confirmPassword !== form.password
                       ? 'Passwords do not match' : null,
  };

  const isFormValid =
    form.fullName.trim() &&
    /^\S+@\S+\.\S+$/.test(form.email) &&
    !validateIndianMobile(form.mobile) &&
    !validatePassword(form.password) &&
    form.confirmPassword === form.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Touch all fields to show any remaining errors
    setTouched({ fullName: true, email: true, mobile: true, password: true, confirmPassword: true });
    if (!isFormValid) return;

    setLoading(true); setServerError('');
    try {
      await register({
        fullName:     form.fullName.trim(),
        email:        form.email,
        mobile:       form.mobile,
        password:     form.password,
        referralCode: form.referralCode.trim().toUpperCase() || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Eye toggle button ─────────────────────────────────────────────────────
  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle}
      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nx-muted)', fontSize: '14px', padding: '0' }}>
      {show ? '🙈' : '👁'}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--nx-bg)', padding: '24px 16px' }}>
      <div style={{ background: 'var(--nx-card)', border: '1px solid var(--nx-border)', borderRadius: '12px', padding: '36px', width: '100%', maxWidth: '440px' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--nx-blue)', marginBottom: '6px' }}>Create Account</div>
          <div style={{ fontSize: '14px', color: 'var(--nx-muted)' }}>Join NexaChain AI today</div>
        </div>

        {serverError && <div style={{ marginBottom: '16px' }}><Alert type="error">{serverError}</Alert></div>}

        {form.referralCode && (
          <div style={{ marginBottom: '16px' }}>
            <Alert type="info">Referred by code: <strong style={{ fontFamily: 'var(--font-mono)' }}>{form.referralCode}</strong></Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Full Name */}
          <div>
            <label style={labelStyle}>Full Name</label>
            <input style={inputBase(errors.fullName)} placeholder="Rahul Kumar" value={form.fullName}
              onChange={set('fullName')} onBlur={touch('fullName')} />
            {errors.fullName && <div style={{ fontSize: '12px', color: 'var(--nx-red)', marginTop: '4px' }}>{errors.fullName}</div>}
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" style={inputBase(errors.email)} placeholder="rahul@example.com" value={form.email}
              onChange={set('email')} onBlur={touch('email')} />
            {errors.email && <div style={{ fontSize: '12px', color: 'var(--nx-red)', marginTop: '4px' }}>{errors.email}</div>}
          </div>

          {/* Mobile */}
          <div>
            <label style={labelStyle}>Mobile Number</label>
            <input type="tel" style={inputBase(errors.mobile)} placeholder="+91 98765 43210" value={form.mobile}
              onChange={set('mobile')} onBlur={touch('mobile')} maxLength={10} />
            {errors.mobile
              ? <div style={{ fontSize: '12px', color: 'var(--nx-red)', marginTop: '4px' }}>{errors.mobile}</div>
              : touched.mobile && !errors.mobile && form.mobile
                ? <div style={{ fontSize: '12px', color: 'var(--nx-green)', marginTop: '4px' }}>✓ Valid Indian mobile number</div>
                : <div style={{ fontSize: '12px', color: 'var(--nx-muted)', marginTop: '4px' }}>Formats accepted: +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX</div>
            }
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} style={{ ...inputBase(errors.password && touched.password), paddingRight: '40px' }}
                placeholder="Min 8 chars, upper + lower + number + symbol" value={form.password}
                onChange={set('password')} onBlur={touch('password')} />
              <EyeBtn show={showPass} toggle={() => setShowPass(s => !s)} />
            </div>
            <PasswordStrengthMeter password={form.password} />
          </div>

          {/* Confirm Password */}
          <div>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showConf ? 'text' : 'password'} style={{ ...inputBase(errors.confirmPassword), paddingRight: '40px' }}
                placeholder="Re-enter your password" value={form.confirmPassword}
                onChange={set('confirmPassword')} onBlur={touch('confirmPassword')} />
              <EyeBtn show={showConf} toggle={() => setShowConf(s => !s)} />
            </div>
            {errors.confirmPassword && <div style={{ fontSize: '12px', color: 'var(--nx-red)', marginTop: '4px' }}>{errors.confirmPassword}</div>}
            {touched.confirmPassword && !errors.confirmPassword && form.confirmPassword &&
              <div style={{ fontSize: '12px', color: 'var(--nx-green)', marginTop: '4px' }}>✓ Passwords match</div>}
          </div>

          {/* Referral Code */}
          <div>
            <label style={labelStyle}>Referral Code <span style={{ color: 'var(--nx-muted)', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input style={inputBase(false)} placeholder="e.g. NX8A3C1D" value={form.referralCode}
              onChange={set('referralCode')} />
          </div>

          <Button type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--nx-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--nx-blue)', fontWeight: '500' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
