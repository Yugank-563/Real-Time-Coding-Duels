import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, ProtectedRoute, AppLayout, AuthLayout } from './components/index';

// ── Auth Pages ──
import { 
  Login as LoginPage, 
  Signup as SignupPage, 
  VerifyOTP as VerifyOTPPage, 
  ForgotPassword as ForgotPasswordPage, 
  ResetPassword as ResetPasswordPage 
} from './pages/index';

import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { api } from './utils/index';
import { setUser, setLoading, selectAuthLoading } from './features/index';

// ── Protected Dashboard Page ──
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BattleLobbyPage = lazy(() => import('./pages/battle/BattleLobby'));
const MatchmakingPage = lazy(() => import('./pages/battle/Matchmaking'));
const BattleRoomPage = lazy(() => import('./pages/battle/BattleRoom'));
const BattleSummaryPage = lazy(() => import('./pages/battle/BattleSummary'));
const PrivateLobbyPage = lazy(() => import('./pages/battle/PrivateLobby'));
const InvitationHistoryPage = lazy(() => import('./pages/battle/InvitationHistory'));
const ProblemsPage = lazy(() => import('./pages/ProblemsPage'));
const PracticeRoom = lazy(() => import('./pages/PracticeRoom'));

const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const NotFound = lazy(() => import('./components/ui/NotFound'));

// ── Public Pages ──
const AboutPage = lazy(() => import('./pages/AboutPage'));

function App() {
  const dispatch = useDispatch();
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
      <Suspense fallback={
        <div className="min-h-screen bg-[#0B0F1A] text-[#E0E6F0] flex flex-col items-center justify-center font-sans gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#00F5C4] border-t-transparent animate-spin" />
          <span className="text-xs text-[#7A9AB8] font-medium tracking-wide">Loading module...</span>
        </div>
      }>
        <Routes>
          {/* Public Landing / About Page */}
          <Route path="/" element={<AboutPage />} />

          {/* Public App Routes (with Layout) */}
          <Route element={<AppLayout />}>
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Route>

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
              <Route path="/invitations" element={<InvitationHistoryPage />} />
              <Route path="/battle/private/:roomId/lobby" element={<PrivateLobbyPage />} />
              <Route path="/battle/:battleId/summary" element={<BattleSummaryPage />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
            </Route>
            {/* Fullscreen workspaces outside AppLayout (no footer/constraints, custom fixed Navbar spacing) */}
            <Route path="/battle/:battleId" element={<BattleRoomPage />} />
            <Route path="/problems/:slug" element={<PracticeRoom />} />

          </Route>

          {/* Global Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
