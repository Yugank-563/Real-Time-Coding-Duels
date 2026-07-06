import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast, useDocumentTitle } from '../../hooks/index';
import { api } from '../../utils/index';
import {
  Logo, Input, Button,
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
    useDocumentTitle('Forgot Password');

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
    if (!email) { setEmailErr('Email is required.'); toast.error('Email is required.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailErr('Enter a valid email.'); toast.error('Enter a valid email.'); return; }
    setEmailErr(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Check your email for the verification code');
      setStepIdx(1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP.';
      setEmailErr(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setOtpErr('Enter a valid 6-digit code.'); toast.error('Enter a valid 6-digit code.'); return; }
    setOtpErr(''); setLoading(true);
    try {
      await api.post('/auth/verify-reset-otp', { email, otp });
      toast.success('Set your new password.');
      setStepIdx(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired code.';
      setOtpErr(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPw || newPw.length < 6) { setPwErr('Min. 6 characters.'); toast.error('Min. 6 characters.'); return; }
    if (newPw !== confirmPw)         { setPwErr('Passwords do not match.'); toast.error('Passwords do not match.'); return; }
    setPwErr(''); setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: newPw });
      toast.success('Password updated successfully');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed.';
      setPwErr(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const stepContent = [
    { title: 'Forgot Password?', sub: 'Enter your email to receive a reset code.' },
    { title: 'Check your email', sub: 'We sent a 6-digit code to your email.' },
    { title: 'Set New Password', sub: 'Choose a strong password for your account.' },
  ];
  const { title, sub } = stepContent[Math.min(stepIdx, 2)];

  return (
    <div className="page-bg">
      <div className="card">
        <Logo className="mx-auto mb-4" disableAnimation={true} />


            <StepIndicator current={stepIdx} />

            {/* Heading */}
            <div className="text-center mb-5">
              <h1 className="text-[1.2rem] font-bold text-[var(--text-primary)] m-0 tracking-tight">
                {title}
              </h1>
              <p className="text-[0.78rem] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                {sub}
              </p>
            </div>

            {/* Step 0: Email */}
            {stepIdx === 0 && (
              <form onSubmit={handleSendOTP} noValidate
                className="flex flex-col gap-[0.85rem]">
                <Input
                  label="Email address"
                  type="email" id="fp-email" name="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
                  placeholder="you@example.com"
                  required autoComplete="email" error={emailErr}
                />
                <Button variant="primary" size="full" type="submit" loading={loading}>
                  Send Reset Code
                </Button>
              </form>
            )}

            {/* Step 1: OTP */}
            {stepIdx === 1 && (
              <form onSubmit={handleVerifyOTP} noValidate
                className="flex flex-col gap-4">
                <OTPBoxInput
                  value={otp}
                  onChange={v => { setOtp(v); setOtpErr(''); }}
                  error={otpErr}
                />
                <Button variant="primary" size="full" type="submit" loading={loading}>
                  Verify Code
                </Button>
                <ResendTimer onResend={handleSendOTP} />
              </form>
            )}

            {/* Step 2: New Password */}
            {stepIdx === 2 && (
              <form onSubmit={handleResetPassword} noValidate
                className="flex flex-col gap-[0.85rem]">
                <Input
                    label="New password"
                    type="password" id="fp-new-password" name="newPassword"
                    value={newPw}
                    onChange={e => { setNewPw(e.target.value); setPwErr(''); }}
                    placeholder="Min. 6 characters"
                    required autoComplete="new-password" error={pwErr}
                  />
                <Input
                  label="Confirm password"
                  type="password" id="fp-confirm-password" name="confirmPassword"
                  value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); setPwErr(''); }}
                  placeholder="Confirm new password"
                  required autoComplete="new-password"
                />
                <Button variant="primary" size="full" type="submit" loading={loading}>
                  Reset Password
                </Button>
              </form>
            )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
