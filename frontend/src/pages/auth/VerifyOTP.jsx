import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../features/index';
import { useToast, useDocumentTitle } from '../../hooks/index';
import { api } from '../../utils/index';
import {
  Button, Logo,
  OTPBoxInput, ResendTimer
} from '../../components/index';

const VerifyOTPPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const toast     = useToast();
  useDocumentTitle('Verify Email');


  const email = location.state?.email || '';
  const mode  = location.state?.mode  || 'register';

  const [otp,           setOtp]           = useState('');
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      toast.error('Please enter the complete 6-digit code.');
      return;
    }
    setError(''); setLoading(true);
    try {
      if (mode === 'reset') {
        const { data } = await api.post('/auth/verify-reset-otp', { email, otp });
        toast.success('Please set your new password.');
        navigate('/reset-password', { state: { email, resetToken: data.resetToken } });
      } else {
        const { data } = await api.post('/auth/verify-otp', { email, otp });
        localStorage.setItem('bc-token', data.accessToken);
        dispatch(setUser(data.user));
        toast.success('Welcome to Arena ⚔️');
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed.';
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success(`A new OTP has been sent to your email`);
      setOtp(''); setError('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Please try again.');
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{1})(.*)(@.*)/, (_, a, b, c) =>
        a + '*'.repeat(Math.min(b.length, 5)) + c)
    : 'your email';

  return (
    <div className="page-bg">
      <div className="card">
        <Logo className="mx-auto mb-4" disableAnimation={true} />

        <div className="text-center mb-6">
          <h1 className="text-[1.2rem] font-bold text-[var(--text-primary)] m-0 mb-1 tracking-tight">
            Verify your email
          </h1>
          <p className="text-[0.78rem] text-[var(--text-muted)] m-0 leading-relaxed">
            We sent a 6-digit code to your email.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate
          className="flex flex-col gap-4">
          <OTPBoxInput value={otp} onChange={v => { setOtp(v); setError(''); }} error={error} />
          <Button variant="primary" size="full" type="submit" loading={loading}>Verify Email</Button>
          <ResendTimer onResend={handleResend} />
        </form>

        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => navigate(mode === 'reset' ? '/forgot-password' : '/signup')}>
            ← Back to {mode === 'reset' ? 'Reset Password' : 'Sign Up'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
