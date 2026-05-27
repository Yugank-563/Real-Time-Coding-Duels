import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// ── Auth Pages ──
import LoginPage         from './pages/auth/Login';
import SignupPage         from './pages/auth/Signup';
import VerifyOTPPage      from './pages/auth/VerifyOTP';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import ResetPasswordPage  from './pages/auth/ResetPassword';

import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import api from './utils/api';
import { selectIsAuthenticated, setUser, setLoading, selectAuthLoading } from './features/auth/authSlice';

// ── Protected Dashboard Page ──
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BattleLobbyPage = lazy(() => import('./pages/BattleLobby'));
const MatchmakingPage = lazy(() => import('./pages/Matchmaking'));
const BattleRoomPage = lazy(() => import('./pages/BattleRoom'));
const BattleSummaryPage = lazy(() => import('./pages/BattleSummary'));
const PrivateLobbyPage = lazy(() => import('./pages/PrivateLobby'));

// ── Public Pages ──
const AboutPage = lazy(() => import('./pages/AboutPage'));

// ── Dynamic Fallback Route ──
const FallbackRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />;
};

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);

  // Silent session restoration on application startup
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('bc-token');
      if (!token) return;

      dispatch(setLoading(true));
      try {
        const { data } = await api.get('/auth/me');
        dispatch(setUser(data));
      } catch (err) {
        console.error('Session restoration failed:', err.message);
        localStorage.removeItem('bc-token');
      } finally {
        dispatch(setLoading(false));
      }
    };

    restoreSession();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] text-[#E0E6F0] flex flex-col items-center justify-center font-sans">
        <p className="text-sm text-[#7A9AB8] italic animate-pulse">Restoring authenticated session...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={null}>
        <Routes>
          {/* Public Landing / About Page */}
          <Route path="/" element={<AboutPage />} />

          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Protected App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/battle/lobby" element={<BattleLobbyPage />} />
              <Route path="/battle/matchmaking" element={<MatchmakingPage />} />
              <Route path="/battle/private/:roomId/lobby" element={<PrivateLobbyPage />} />
              <Route path="/battle/:battleId" element={<BattleRoomPage />} />
              <Route path="/battle/:battleId/summary" element={<BattleSummaryPage />} />
            </Route>
          </Route>

          {/* Global Fallback */}
          <Route path="*" element={<FallbackRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
