/** Format number as Indian Rupees */
export const fmtINR = (n = 0) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** Format date to readable string */
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });

/** Get initials from full name */
export const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

/** Status pill colour map */
export const statusColor = {
  active:    { bg: 'rgba(104,211,145,0.15)', color: '#68d391' },
  completed: { bg: 'rgba(99,179,237,0.12)',  color: '#63b3ed' },
  cancelled: { bg: 'rgba(252,129,129,0.12)', color: '#fc8181' },
  credited:  { bg: 'rgba(104,211,145,0.15)', color: '#68d391' },
  pending:   { bg: 'rgba(246,201,14,0.15)',  color: '#f6c90e' },
  failed:    { bg: 'rgba(252,129,129,0.12)', color: '#fc8181' },
  inactive:  { bg: 'rgba(163,191,220,0.1)',  color: 'rgba(163,191,220,0.6)' },
  suspended: { bg: 'rgba(252,129,129,0.12)', color: '#fc8181' },
};
