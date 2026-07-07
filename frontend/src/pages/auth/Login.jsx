import {  useState  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../features/index';
import { useToast, useDocumentTitle } from '../../hooks/index';
import { api } from '../../utils/index';
import {
  Input, Button, Logo,
} from '../../components/index';

// LOGIN PAGE
const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
    useDocumentTitle('Login');

  const [formData, setData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const next = { email: '', password: '' };
    let ok = true;
    if (!formData.email) { next.email = 'Email is required.'; ok = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { next.email = 'Enter a valid email.'; ok = false; }
    if (!formData.password) { next.password = 'Password is required.'; ok = false; }
    else if (formData.password.length < 6) { next.password = 'Min. 6 characters.'; ok = false; }
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
      const { data } = await api.post('/auth/login', formData);
      const { token, user } = data;
      localStorage.setItem('bc-token', token);
      dispatch(setUser(user));
      toast.success(`Good to see you, ${user?.username || 'Coder'}`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials.';
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
            Sign in to your account
          </h1>
          <p className="text-[0.83rem] text-[var(--text-muted)] mt-1.5">
            Welcome back, warrior
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate
          className="flex flex-col gap-[0.85rem]">

          <Input
            label="Email address"
            type="email" id="login-email" name="email"
            value={formData.email} onChange={handleChange}
            placeholder="Username or E-mail"
            required autoComplete="email" error={errors.email}
          />

          <Input
            label="Password"
            type="password" id="login-password" name="password"
            value={formData.password} onChange={handleChange}
            placeholder="Password"
            required autoComplete="current-password" error={errors.password}
          />

          <div className="mt-1">
            <Button variant="primary" size="full" type="submit" loading={loading}>Sign In</Button>
          </div>
        </form>

        {/* Action row */}
        <div className="action-row mt-3">
          <Button variant="link" id="forgot-password-link"
            onClick={() => navigate('/forgot-password')}
          >  Forgot Password?
          </Button>
          <Button variant="link" id="goto-register-link"
            onClick={() => navigate('/signup')}
          >  Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
