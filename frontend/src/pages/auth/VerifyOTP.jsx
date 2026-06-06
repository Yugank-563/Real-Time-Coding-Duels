import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../features/authSlice';
import { useToast, useTheme } from '../../hooks';
import api from '../../utils/api';
import '../../styles/auth.css';
import {
  AuthButton, AuthLogo,
  OTPBoxInput, ResendTimer,
} from '../../components/ui';

const VerifyOTPPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const toast     = useToast();
  const { theme } = useTheme();
  const isLight   = theme === 'light';

  const email = location.state?.email || '';
  const mode  = location.state?.mode  || 'register';

  const [otp,           setOtp]           = useState('');
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      toast.error('Validation Error', 'Please enter the complete 6-digit code.');
      return;
    }
    setError(''); setLoading(true);
    try {
      if (mode === 'reset') {
        const { data } = await api.post('/auth/verify-reset-otp', { email, otp });
        toast.success('OTP Verified', 'Please set your new password.');
        navigate('/reset-password', { state: { email, resetToken: data.resetToken } });
      } else {
        const { data } = await api.post('/auth/verify-otp', { email, otp });
        localStorage.setItem('bc-token', data.accessToken);
        dispatch(setUser(data.user));
        toast.success('Account verified!', 'Welcome to the BattleCode Arena ⚔️');
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed.';
      setError(msg); toast.error('Verification Failed', msg);
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('Code Resent', `A new OTP has been sent to ${email}`);
      setOtp(''); setError('');
    } catch (err) {
      toast.error('Resend Failed', err.response?.data?.message || 'Please try again.');
    } finally { setResendLoading(false); }
  };

  const maskedEmail = email
    ? email.replace(/(.{1})(.*)(@.*)/, (_, a, b, c) =>
        a + '*'.repeat(Math.min(b.length, 5)) + c)
    : 'your email';

  return (
    <div className="auth-page-bg" data-auth-theme={theme}>
      <div className="auth-card">
        <AuthLogo isLight={isLight} />

        <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700,
            color: 'var(--auth-heading)', margin: '0 0 0.35rem', letterSpacing: '-0.01em' }}>
            Verify your email
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--auth-muted)', margin: 0, lineHeight: 1.5 }}>
            We sent a 6-digit code to
          </p>
          <p style={{ fontSize: '0.82rem', fontWeight: 600,
            color: 'var(--auth-heading)', margin: '0.2rem 0 0' }}>
            {maskedEmail}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <OTPBoxInput value={otp} onChange={v => { setOtp(v); setError(''); }} error={error} />
          <AuthButton type="submit" loading={loading}>Verify Email</AuthButton>
          <ResendTimer onResend={handleResend} />
        </form>

        <p style={{ textAlign: 'center', marginTop: '0.9rem' }}>
          <button type="button" className="auth-link"
            style={{ fontSize: '0.78rem', color: 'var(--auth-muted)' }}
            onClick={() => navigate(mode === 'reset' ? '/forgot-password' : '/signup')}>
            ← Back to {mode === 'reset' ? 'Reset Password' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
