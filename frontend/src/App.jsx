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

import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './features/auth/authSlice';

// ── Protected Dashboard Page ──
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// ── Public Pages ──
const AboutPage = lazy(() => import('./pages/AboutPage'));

// ── Dynamic Fallback Route ──
const FallbackRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />;
};

function App() {
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
