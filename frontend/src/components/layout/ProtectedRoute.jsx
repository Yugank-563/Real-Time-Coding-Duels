import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../features/authSlice';

// ProtectedRoute - Route guard to protect pages from unauthenticated access.
// Returns <Outlet /> (children routes) if authorized, or redirects to /login.
const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = localStorage.getItem('bc-token');

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
