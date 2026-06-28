import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast, useTheme, useDocumentTitle } from '../../hooks/index';
import { api } from '../../utils/index';
import '../../styles/auth.css';
import {
  AuthInput, AuthButton, AuthLogo,
  OTPBoxInput, StepIndicator, ResendTimer
} from '../../components/index';

// FORGOT PASSWORD PAGE  (3-step flow)
// Step 0 — Email
// Step 1 — Verify OTP
// Step 2 — Set New Password
// Step 3 — Success
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const toast    = useToast();
  const { theme } = useTheme();
  useDocumentTitle('Forgot Password');
  const isLight   = theme === 'light';

  const [stepIdx,   setStepIdx]   = useState(0);
  const [email,     setEmail]     = useState('');
  const [emailErr,  setEmailErr]  = useState('');
  const [otp,       setOtp]       = useState('');
  const [otpErr,    setOtpErr]    = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwErr,     setPwErr]     = useState('');
  const [loading,   setLoading]   = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!email) { setEmailErr('Email is required.'); toast.error('Validation Error', 'Email is required.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailErr('Enter a valid email.'); toast.error('Validation Error', 'Enter a valid email.'); return; }
    setEmailErr(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP Dispatched', `Check your inbox at ${email}`);
      setStepIdx(1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP.';
      setEmailErr(msg); toast.error('Error', msg);
    } finally { setLoading(false); }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setOtpErr('Enter a valid 6-digit code.'); toast.error('Validation Error', 'Enter a valid 6-digit code.'); return; }
    setOtpErr(''); setLoading(true);
    try {
      await api.post('/auth/verify-reset-otp', { email, otp });
      toast.success('Code Verified', 'Set your new password.');
      setStepIdx(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired code.';
      setOtpErr(msg); toast.error('Verification Failed', msg);
    } finally { setLoading(false); }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPw || newPw.length < 6) { setPwErr('Min. 6 characters.'); toast.error('Validation Error', 'Min. 6 characters.'); return; }
    if (newPw !== confirmPw)         { setPwErr('Passwords do not match.'); toast.error('Validation Error', 'Passwords do not match.'); return; }
    setPwErr(''); setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: newPw });
      toast.success('Password Reset!', 'You can now sign in with your new password.');
      setStepIdx(3);
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed.';
      setPwErr(msg); toast.error('Reset Failed', msg);
    } finally { setLoading(false); }
  };

  const stepContent = [
    { title: 'Forgot Password?', sub: 'Enter your email to receive a reset code.' },
    { title: 'Check your email', sub: `We sent a 6-digit code to ${email || 'your email'}.` },
    { title: 'Set New Password', sub: 'Choose a strong password for your account.' },
  ];
  const { title, sub } = stepContent[Math.min(stepIdx, 2)];

  return (
    <div className="auth-page-bg" data-auth-theme={theme}>
      <div className="auth-card">
        <AuthLogo isLight={isLight} />

        {/* Success screen */}
        {stepIdx === 3 ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0 0.25rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700,
              color: 'var(--auth-heading)', margin: '0 0 0.4rem' }}>
              Password Updated!
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--auth-muted)',
              marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Your password has been successfully reset. Sign in to continue.
            </p>
            <AuthButton onClick={() => navigate('/login')}>
              Go to Sign In →
            </AuthButton>
          </div>
        ) : (
          <>
            <StepIndicator current={stepIdx} />

            {/* Heading */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700,
                color: 'var(--auth-heading)', margin: 0, letterSpacing: '-0.01em' }}>
                {title}
              </h1>
              <p style={{ fontSize: '0.78rem', color: 'var(--auth-muted)',
                marginTop: '0.35rem', lineHeight: 1.5 }}>
                {sub}
              </p>
            </div>

            {/* Step 0: Email */}
            {stepIdx === 0 && (
              <form onSubmit={handleSendOTP} noValidate
                style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <AuthInput
                  label="Email address"
                  type="email" id="fp-email" name="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
                  placeholder="you@example.com"
                  required autoComplete="email" error={emailErr}
                />
                <AuthButton type="submit" loading={loading}>
                  Send Reset Code
                </AuthButton>
              </form>
            )}

            {/* Step 1: OTP */}
            {stepIdx === 1 && (
              <form onSubmit={handleVerifyOTP} noValidate
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <OTPBoxInput
                  value={otp}
                  onChange={v => { setOtp(v); setOtpErr(''); }}
                  error={otpErr}
                />
                <AuthButton type="submit" loading={loading}>
                  Verify Code
                </AuthButton>
                <ResendTimer onResend={handleSendOTP} />
              </form>
            )}

            {/* Step 2: New Password */}
            {stepIdx === 2 && (
              <form onSubmit={handleResetPassword} noValidate
                style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <AuthInput
                    label="New password"
                    type="password" id="fp-new-password" name="newPassword"
                    value={newPw}
                    onChange={e => { setNewPw(e.target.value); setPwErr(''); }}
                    placeholder="Min. 6 characters"
                    required autoComplete="new-password" error={pwErr}
                  />
                <AuthInput
                  label="Confirm password"
                  type="password" id="fp-confirm-password" name="confirmPassword"
                  value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); setPwErr(''); }}
                  placeholder="Confirm new password"
                  required autoComplete="new-password"
                />
                <AuthButton type="submit" loading={loading}>
                  Reset Password
                </AuthButton>
              </form>
            )}

            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button type="button" className="auth-link"
                style={{ fontSize: '0.78rem', color: 'var(--auth-muted)' }}
                onClick={() => navigate('/login')}>
                ← Back to Sign In
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
