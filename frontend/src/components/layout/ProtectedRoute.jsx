import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../features/index';

// ProtectedRoute - Route guard to protect pages from unauthenticated access.
// Returns <Outlet /> (children routes) if authorized, or redirects to /login.
const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = localStorage.getItem('bc-token');

  if (!isAuthenticated && !token) {
    // If a guest tries to visit the root (Battle Lobby), show them the marketing About page instead of forcing a login wall.
    if (window.location.pathname === '/') {
      return <Navigate to="/about" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
