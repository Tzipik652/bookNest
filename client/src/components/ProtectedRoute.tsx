import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user: currentUser } = useUserStore();
  const location=useLocation();
  if (!currentUser) {
const redirectPath = `/login?redirect=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
