import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user: currentUser } = useUserStore();

  if (currentUser) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
