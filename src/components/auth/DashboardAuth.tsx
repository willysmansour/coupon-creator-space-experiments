import { ReactNode, useEffect } from "react";
import { useAuth, useUserRole } from "@/domains/auth";
import { useNavigate, useLocation } from "react-router-dom";

interface DashboardAuthProps {
  children: ReactNode;
}

export function DashboardAuth({ children }: DashboardAuthProps) {
  const { user, loading: authLoading } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to auth if no user is authenticated (hook must be called before any early returns)
  useEffect(() => {
    if (!authLoading && !user) {
      const redirectPath = location.pathname !== '/auth' ? location.pathname : '/';
      navigate(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [user, authLoading, navigate, location.pathname]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow all authenticated users to access the dashboard
  // Role-based filtering will be handled in individual components

  // User is authenticated with appropriate role
  return <>{children}</>;
}
