import { statusColor } from '../utils/format';

export function StatCard({ label, value, delta, deltaUp, accentColor = 'var(--nx-blue)', icon }) {
  return (
    <div style={{
      background: 'var(--nx-card)',
      border: '1px solid var(--nx-border)',
      borderRadius: '10px',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      borderTop: `2px solid ${accentColor}`,
    }}>
      {icon && (
        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '28px', opacity: 0.07 }}>
          {icon}
        </div>
      )}
      <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--nx-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: accentColor, lineHeight: 1 }}>{value}</div>
      {delta && (
        <div style={{ fontSize: '12px', marginTop: '8px', color: deltaUp ? 'var(--nx-green)' : 'var(--nx-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {deltaUp ? '↑' : '↓'} {delta}
        </div>
      )}
    </div>
  );
}

export function Panel({ title, badge, children, style = {}, action }) {
  return (
    <div style={{ background: 'var(--nx-card)', border: '1px solid var(--nx-border)', borderRadius: '10px', overflow: 'hidden', ...style }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--nx-border)' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--nx-text)' }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {action}
            {badge && <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '20px', background: 'rgba(99,179,237,0.12)', color: 'var(--nx-blue)' }}>{badge}</span>}
          </div>
        </div>
      )}
      <div style={{ padding: '18px' }}>{children}</div>
    </div>
  );
}

export function Pill({ status }) {
  const colors = statusColor[status] || { bg: 'rgba(99,179,237,0.12)', color: 'var(--nx-blue)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: '500', background: colors.bg, color: colors.color }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
      {status}
    </span>
  );
}

export function DataTable({ columns, rows, emptyMessage = 'No data found' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: 'left', padding: '9px 14px', color: 'var(--nx-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.8px', textTransform: 'uppercase', borderBottom: '1px solid var(--nx-border)', whiteSpace: 'nowrap' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '36px', color: 'var(--nx-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : rows.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '11px 14px', borderBottom: i < rows.length - 1 ? '1px solid rgba(99,179,237,0.06)' : 'none', ...col.style }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px', color: 'var(--nx-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px', gap: '8px' }}>
      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
      {text}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function ErrorMessage({ message }) {
  return (
    <div style={{ background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.25)', borderRadius: '8px', padding: '12px 16px', color: 'var(--nx-red)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
      ✗ {message}
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, style = {}, type = 'button' }) {
  const sizes = { sm: { padding: '5px 12px', fontSize: '12px' }, md: { padding: '9px 20px', fontSize: '14px' } };
  const variants = {
    primary: { background: 'var(--nx-accent)', color: '#fff', border: 'none' },
    ghost:   { background: 'transparent', color: 'var(--nx-blue)', border: '1px solid var(--nx-border)' },
    danger:  { background: 'rgba(252,129,129,0.12)', color: 'var(--nx-red)', border: '1px solid rgba(252,129,129,0.2)' },
  };
  return (
    <button
      type={type}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '8px', fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'opacity .15s', opacity: disabled ? 0.5 : 1, ...sizes[size], ...variants[variant], ...style }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function FormField({ label, children, error, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--nx-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{label}</label>}
      {children}
      {hint && !error && <div style={{ fontSize: '12px', color: 'var(--nx-muted)' }}>{hint}</div>}
      {error && <div style={{ fontSize: '12px', color: 'var(--nx-red)' }}>{error}</div>}
    </div>
  );
}

export function Input({ ...props }) {
  return (
    <input
      {...props}
      style={{ width: '100%', background: 'var(--nx-surface)', border: '1px solid var(--nx-border)', borderRadius: '8px', padding: '9px 13px', color: 'var(--nx-text)', fontSize: '14px', outline: 'none', transition: 'border-color .15s', ...props.style }}
      onFocus={e => e.target.style.borderColor = 'var(--nx-accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--nx-border)'}
    />
  );
}

export function Alert({ type = 'info', children }) {
  const map = {
    success: { bg: 'rgba(104,211,145,0.08)', border: 'rgba(104,211,145,0.25)', color: 'var(--nx-green)' },
    error:   { bg: 'rgba(252,129,129,0.08)', border: 'rgba(252,129,129,0.25)', color: 'var(--nx-red)' },
    info:    { bg: 'rgba(99,179,237,0.08)',  border: 'rgba(99,179,237,0.2)',   color: 'var(--nx-blue)' },
  };
  const s = map[type];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '8px', padding: '11px 15px', color: s.color, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
      {children}
    </div>
  );
}
