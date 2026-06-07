import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../features/index';
import { useToast, useTheme, useDocumentTitle } from '../../hooks/index';
import { api } from '../../utils/index';
import '../../styles/auth.css';
import {
  AuthInput, AuthButton, AuthLogo,
} from '../../components/index';

/* ══════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════ */
const LoginPage = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const toast     = useToast();
  const { theme } = useTheme();
  useDocumentTitle('Login');
  const isLight   = theme === 'light';

  const [formData, setData]   = useState({ email: '', password: '' });
  const [errors,   setErrors] = useState({ email: '', password: '' });
  const [loading,  setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const next = { email: '', password: '' };
    let ok = true;
    if (!formData.email)
      { next.email = 'Email is required.'; ok = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      { next.email = 'Enter a valid email.'; ok = false; }
    if (!formData.password)
      { next.password = 'Password is required.'; ok = false; }
    else if (formData.password.length < 6)
      { next.password = 'Min. 6 characters.'; ok = false; }
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
      const { data } = await api.post('/auth/login', formData);
      const { accessToken, user } = data;
      localStorage.setItem('bc-token', accessToken);
      dispatch(setUser(user));
      toast.success('Welcome back!', `Good to see you, ${user?.username || 'Coder'}`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials.';
      setErrors(p => ({ ...p, email: msg }));
      toast.error('Login Failed', msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page-bg" data-auth-theme={theme}>
      <div className="auth-card">
        <AuthLogo isLight={isLight} />

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700,
            color: 'var(--auth-heading)', margin: 0,
            letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            Sign in to your account
          </h1>
          <p style={{ fontSize: '0.83rem', color: 'var(--auth-muted)', marginTop: '0.4rem' }}>
            Welcome back, warrior
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

          <AuthInput
            label="Email address"
            type="email" id="login-email" name="email"
            value={formData.email} onChange={handleChange}
            placeholder="Username or E-mail"
            required autoComplete="email" error={errors.email}
          />

          <AuthInput
            label="Password"
            type="password" id="login-password" name="password"
            value={formData.password} onChange={handleChange}
            placeholder="Password"
            required autoComplete="current-password" error={errors.password}
          />

          <div style={{ marginTop: '0.3rem' }}>
            <AuthButton type="submit" loading={loading}>Sign In</AuthButton>
          </div>
        </form>

        {/* Action row */}
        <div className="auth-action-row" style={{ marginTop: '0.7rem' }}>
          <button type="button" id="forgot-password-link"
            className="auth-link" style={{ fontSize: '0.82rem' }}
            onClick={() => navigate('/forgot-password')}>
            Forgot Password?
          </button>
          <button type="button" id="goto-register-link"
            className="auth-link" style={{ fontSize: '0.82rem' }}
            onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
