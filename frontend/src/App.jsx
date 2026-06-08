import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Invest from './pages/Invest';
import ROIHistory from './pages/ROIHistory';
import Referrals from './pages/Referrals';
import Wallet from './pages/Wallet';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--nx-muted)',fontFamily:'var(--font-mono)' }}>Loading...</div>;
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="invest" element={<Invest />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="roi-history" element={<ROIHistory />} />
        <Route path="referrals" element={<Referrals />} />
        <Route path="wallet" element={<Wallet />} />
      </Route>
    </Routes>
  );
}
