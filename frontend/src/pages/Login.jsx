import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Alert } from '../components/UI';

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

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setError(''); };
  const touch = (key) => () => setTouched(t => ({ ...t, [key]: true }));

  const emailError = touched.email && !/^\S+@\S+\.\S+$/.test(form.email) ? 'Enter a valid email address' : null;
  const passError  = touched.password && !form.password ? 'Password is required' : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!form.email || !form.password) return;
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--nx-bg)', padding: '20px' }}>
      <div style={{ background: 'var(--nx-card)', border: '1px solid var(--nx-border)', borderRadius: '12px', padding: '36px', width: '100%', maxWidth: '400px' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--nx-blue)', marginBottom: '6px' }}>NexaChain AI</div>
          <div style={{ fontSize: '14px', color: 'var(--nx-muted)' }}>Sign in to your account</div>
        </div>

        {error && <div style={{ marginBottom: '16px' }}><Alert type="error">{error}</Alert></div>}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" style={inputBase(emailError)} placeholder="rahul@example.com"
              value={form.email} onChange={set('email')} onBlur={touch('email')} />
            {emailError && <div style={{ fontSize: '12px', color: 'var(--nx-red)', marginTop: '4px' }}>{emailError}</div>}
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'}
                style={{ ...inputBase(passError), paddingRight: '40px' }}
                placeholder="Your password" value={form.password}
                onChange={set('password')} onBlur={touch('password')} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nx-muted)', fontSize: '14px', padding: 0 }}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
            {passError && <div style={{ fontSize: '12px', color: 'var(--nx-red)', marginTop: '4px' }}>{passError}</div>}
          </div>

          <Button type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--nx-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--nx-blue)', fontWeight: '500' }}>Create one</Link>
        </div>
      </div>
    </div>
  );
}
