import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  reverse?: boolean;
}

export function ProtectedRoute({ reverse = false }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();

  if (reverse) {
    // If authenticated, redirect to home instead of showing the page (e.g. for /login)
    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
  }

  // If not authenticated, redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
