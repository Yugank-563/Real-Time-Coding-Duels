import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast, useDocumentTitle } from '../../hooks/index';
import { api } from '../../utils/index';
import {
  Input, Button, Logo,
} from '../../components/index';


// RESET PASSWORD PAGE  
const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  useDocumentTitle('Reset Password');

  const email = location.state?.email || '';
  const resetToken = location.state?.resetToken || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true });
  }, []);

  const validate = () => {
    const next = { password: '', confirm: '' };
    let ok = true;
    if (!password) { next.password = 'Password is required.'; ok = false; }
    else if (password.length < 6) { next.password = 'Min. 6 characters.'; ok = false; }
    if (!confirm) { next.confirm = 'Please confirm password.'; ok = false; }
    else if (password !== confirm) { next.confirm = 'Passwords do not match.'; ok = false; }
    setErrors(next);
    if (!ok) {
      const first = Object.values(next).find(v => v);
      toast.error(first);
    }
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, resetToken, newPassword: password });
      toast.success('Password updated successfully');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. Try again.';
      setErrors(p => ({ ...p, password: msg }));
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="page-bg">
      <div className="card">
        <Logo className="mx-auto mb-4" disableAnimation={true} />


            <div className="text-center mb-5">
              <h1 className="text-[1.2rem] font-bold text-[var(--text-primary)] m-0 tracking-tight">
                Set New Password
              </h1>
              <p className="text-[0.78rem] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Choose a strong password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate
              className="flex flex-col gap-[0.85rem]">
              <Input
                label="New password"
                type="password" id="rp-password" name="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                placeholder="Min. 6 characters"
                required autoComplete="new-password" error={errors.password}
              />

              <Input
                label="Confirm password"
                type="password" id="rp-confirm" name="confirm"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }}
                placeholder="Confirm new password"
                required autoComplete="new-password" error={errors.confirm}
              />

              <Button variant="primary" size="full" type="submit" loading={loading}>
                Reset Password
              </Button>
            </form>

            <div className="text-center mt-4">
              <Button variant="link" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
            </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
