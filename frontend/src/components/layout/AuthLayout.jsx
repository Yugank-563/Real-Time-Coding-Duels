import { Outlet } from 'react-router-dom';
import Footer from './Footer';

// AuthLayout — layout wrapper for authentication pages.
// Adds a 64px (pt-16) paddingTop offset to sit cleanly beneath the global fixed Header.
const AuthLayout = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '64px' }}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
      <Outlet />
    </div>
    <Footer />
  </div>
);

export default AuthLayout;
