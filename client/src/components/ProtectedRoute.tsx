import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user: currentUser } = useUserStore();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
