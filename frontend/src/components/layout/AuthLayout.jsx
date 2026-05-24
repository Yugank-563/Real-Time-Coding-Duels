import { Outlet } from 'react-router-dom';

// AuthLayout — minimal pass-through wrapper.
// Each auth page (LoginPage, SignupPage, etc.) renders its own
// full-screen background with the Cyber Dark palette + dot-grid.
const AuthLayout = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Outlet />
  </div>
);

export default AuthLayout;
