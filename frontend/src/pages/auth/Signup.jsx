import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast, useDocumentTitle } from '../../hooks/index';
import { api } from '../../utils/index';
import { Input, Button, Logo } from '../../components/index';

// SIGNUP PAGE
const SignupPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
    useDocumentTitle('Signup');

  const [formData, setData] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const next = { email: '', password: '', confirmPassword: '' };
    let ok = true;
    if (!formData.email) { next.email = 'Email is required.'; ok = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { next.email = 'Enter a valid email.'; ok = false; }
    if (!formData.password) { next.password = 'Password is required.'; ok = false; }
    else if (formData.password.length < 6) { next.password = 'Min. 6 characters.'; ok = false; }
    if (!formData.confirmPassword) { next.confirmPassword = 'Please confirm password.'; ok = false; }
    else if (formData.password !== formData.confirmPassword) { next.confirmPassword = 'Passwords do not match.'; ok = false; }
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
      await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
      });
      toast.success('Verification code sent to your email');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setErrors(p => ({ ...p, email: msg }));
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="page-bg">
      <div className="card">
        <Logo className="mx-auto mb-4" disableAnimation={true} />

        {/* Heading */}
        <div className="text-center mb-5">
          <h1 className="text-xl font-bold text-[var(--text-primary)] m-0 tracking-tight leading-snug">
            Create your account
          </h1>
          <p className="text-[0.83rem] text-[var(--text-muted)] mt-1.5">
            Join the arena. Code. Compete. Conquer.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate
          className="flex flex-col gap-3">

          <Input
            label="Email address"
            type="email" id="signup-email" name="email"
            value={formData.email} onChange={handleChange}
            placeholder="you@example.com"
            required autoComplete="email" error={errors.email}
          />

          <Input
            label="Password"
            type="password" id="signup-password" name="password"
            value={formData.password} onChange={handleChange}
            placeholder="Min. 6 characters"
            required autoComplete="new-password" error={errors.password}
          />


          <Input
            label="Confirm password"
            type="password" id="signup-confirm-password" name="confirmPassword"
            value={formData.confirmPassword} onChange={handleChange}
            placeholder="Confirm Password"
            required autoComplete="new-password" error={errors.confirmPassword}
          />

          <div className="mt-1.5">
            <Button variant="primary" size="full" type="submit" loading={loading}>Register</Button>
          </div>
        </form>

        {/* Action row */}
        <div className="action-row mt-3">
          <span className="text-[0.78rem] text-[var(--text-muted)]">Already have an account?</span>
          <Button variant="link" id="goto-login-link" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
