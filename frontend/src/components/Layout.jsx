import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/format';

const NAV = [
  { section: 'Main' },
  { to: '/dashboard',   label: 'Dashboard',    icon: '▦' },
  { to: '/invest',      label: 'Invest',       icon: '⬆' },
  { to: '/portfolio',   label: 'Portfolio',    icon: '⊞' },
  { section: 'Earnings' },
  { to: '/roi-history', label: 'ROI History',  icon: '◈' },
  { to: '/referrals',   label: 'Referral Tree',icon: '⊛' },
  { to: '/wallet',      label: 'Wallet',       icon: '◎' },
];

const navLinkStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '9px 18px',
  fontSize: '14px',
  fontWeight: '500',
  color: isActive ? 'var(--nx-blue)' : 'var(--nx-muted)',
  background: isActive ? 'rgba(99,179,237,0.08)' : 'transparent',
  borderLeft: isActive ? '2px solid var(--nx-blue)' : '2px solid transparent',
  transition: 'all .15s',
  textDecoration: 'none',
});

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh' }}>
      
      {/* ✅ Fixed Sidebar */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '215px',
          height: '100vh',
          background: 'var(--nx-surface)',
          borderRight: '1px solid var(--nx-border)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 18px 18px', borderBottom: '1px solid var(--nx-border)' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--nx-blue)' }}>
            NexaChain AI
          </div>
          <div style={{
            fontSize: '10px',
            color: 'var(--nx-muted)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            marginTop: '2px'
          }}>
            Investment Platform
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, paddingTop: '8px', overflowY: 'auto' }}>
          {NAV.map((item, i) =>
            item.section ? (
              <div
                key={i}
                style={{
                  padding: '14px 18px 5px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'var(--nx-muted)',
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {item.section}
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} style={navLinkStyle}>
                <span style={{ width: '18px', textAlign: 'center' }}>
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            )
          )}
        </div>

        {/* Logout */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--nx-border)' }}>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--nx-muted)',
              cursor: 'pointer',
              fontSize: '13px',
            }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--nx-red)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--nx-muted)'}
          >
            ⏻ Logout
          </button>
        </div>
      </nav>

      {/* ✅ Main Content Area */}
      <div
        style={{
          marginLeft: '215px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            borderBottom: '1px solid var(--nx-border)',
            background: 'rgba(10,14,26,0.9)',
            backdropFilter: 'blur(8px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>
              NexaChain AI
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--nx-muted)',
              fontFamily: 'var(--font-mono)'
            }}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--nx-card)',
                border: '1px solid var(--nx-border)',
                borderRadius: '40px',
                padding: '6px 14px 6px 6px'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,var(--nx-accent),var(--nx-teal))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#fff',
                }}
              >
                {initials(user.fullName)}
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>
                  {user.fullName}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--nx-muted)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  REF: {user.referralCode}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}