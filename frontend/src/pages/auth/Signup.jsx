import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import api from '../../utils/api';
import '../../styles/auth.css';
import {
  AuthInput, AuthButton, AuthLogo, ThemeToggle, useAuthTheme,
} from '../../components/ui';

// SIGNUP PAGE
const SignupPage = () => {
  const navigate  = useNavigate();
  const toast     = useToast();
  const [theme, toggleTheme, isLight] = useAuthTheme();

  const [formData, setData]   = useState({ email: '', password: '', confirmPassword: '' });
  const [errors,   setErrors] = useState({ email: '', password: '', confirmPassword: '' });
  const [loading,  setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const next = { email: '', password: '', confirmPassword: '' };
    let ok = true;
    if (!formData.email)
      { next.email = 'Email is required.'; ok = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      { next.email = 'Enter a valid email.'; ok = false; }
    if (!formData.password)
      { next.password = 'Password is required.'; ok = false; }
    else if (formData.password.length < 6)
      { next.password = 'Min. 6 characters.'; ok = false; }
    if (!formData.confirmPassword)
      { next.confirmPassword = 'Please confirm password.'; ok = false; }
    else if (formData.password !== formData.confirmPassword)
      { next.confirmPassword = 'Passwords do not match.'; ok = false; }
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
      await api.post('/auth/register', {
        email:    formData.email,
        password: formData.password,
      });
      toast.success('OTP Dispatched!', `Verification email sent to ${formData.email}`);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setErrors(p => ({ ...p, email: msg }));
      toast.error('Registration Failed', msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page-bg" data-auth-theme={theme}>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      <div className="auth-card">
        <AuthLogo isLight={isLight} />

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700,
            color: 'var(--auth-heading)', margin: 0,
            letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            Create your account
          </h1>
          <p style={{ fontSize: '0.83rem', color: 'var(--auth-muted)', marginTop: '0.4rem' }}>
            Join the arena. Code. Compete. Conquer.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          <AuthInput
            label="Email address"
            type="email" id="signup-email" name="email"
            value={formData.email} onChange={handleChange}
            placeholder="you@example.com"
            required autoComplete="email" error={errors.email}
          />

          <AuthInput
              label="Password"
              type="password" id="signup-password" name="password"
              value={formData.password} onChange={handleChange}
              placeholder="Min. 6 characters"
              required autoComplete="new-password" error={errors.password}
            />


          <AuthInput
            label="Confirm password"
            type="password" id="signup-confirm-password" name="confirmPassword"
            value={formData.confirmPassword} onChange={handleChange}
            placeholder="Confirm Password"
            required autoComplete="new-password" error={errors.confirmPassword}
          />

          <div style={{ marginTop: '0.4rem' }}>
            <AuthButton type="submit" loading={loading}>Register</AuthButton>
          </div>
        </form>

        {/* Action row */}
        <div className="auth-action-row" style={{ marginTop: '0.8rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--auth-muted)' }}>
            Already registered?
          </span>
          <button type="button" id="goto-login-link"
            className="auth-link" style={{ fontSize: '0.82rem' }}
            onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
