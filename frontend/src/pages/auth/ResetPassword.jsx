import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import api from '../../utils/api';
import '../../styles/auth.css';
import {
  AuthInput, AuthButton, AuthLogo, ThemeToggle, useAuthTheme,
} from '../../components/ui';

// RESET PASSWORD PAGE  
const ResetPasswordPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const toast     = useToast();
  const [theme, toggleTheme, isLight] = useAuthTheme();

  const email      = location.state?.email      || '';
  const resetToken = location.state?.resetToken || '';

  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [errors,   setErrors]   = useState({ password: '', confirm: '' });
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true });
  }, []);

  const validate = () => {
    const next = { password: '', confirm: '' };
    let ok = true;
    if (!password)               { next.password = 'Password is required.';   ok = false; }
    else if (password.length < 6){ next.password = 'Min. 6 characters.';      ok = false; }
    if (!confirm)                { next.confirm  = 'Please confirm password.'; ok = false; }
    else if (password !== confirm){ next.confirm  = 'Passwords do not match.'; ok = false; }
    setErrors(next);
    if (!ok) {
      const first = Object.values(next).find(v => v);
      toast.error('Validation Error', first);
    }
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, resetToken, newPassword: password });
      toast.success('Password Reset!', 'You can now sign in with your new password.');
      setDone(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. Try again.';
      setErrors(p => ({ ...p, password: msg }));
      toast.error('Reset Failed', msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page-bg" data-auth-theme={theme}>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      <div className="auth-card">
        <AuthLogo isLight={isLight} />

        {done ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0 0.25rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700,
              color: 'var(--auth-heading)', margin: '0 0 0.4rem' }}>
              Password Updated!
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--auth-muted)',
              marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Your password has been successfully reset. You can now sign in.
            </p>
            <AuthButton onClick={() => navigate('/login')}>
              Go to Sign In →
            </AuthButton>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700,
                color: 'var(--auth-heading)', margin: 0, letterSpacing: '-0.01em' }}>
                Set New Password
              </h1>
              <p style={{ fontSize: '0.78rem', color: 'var(--auth-muted)',
                marginTop: '0.35rem', lineHeight: 1.5 }}>
                Choose a strong password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate
              style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <AuthInput
                  label="New password"
                  type="password" id="rp-password" name="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="Min. 6 characters"
                  required autoComplete="new-password" error={errors.password}
                />

              <AuthInput
                label="Confirm password"
                type="password" id="rp-confirm" name="confirm"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }}
                placeholder="Confirm new password"
                required autoComplete="new-password" error={errors.confirm}
              />

              <AuthButton type="submit" loading={loading}>
                Reset Password
              </AuthButton>
            </form>

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

export default ResetPasswordPage;
