import { ReactNode, useEffect } from "react";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { LogIn } from "lucide-react";

interface DashboardAuthProps {
  children: ReactNode;
}

export function DashboardAuth({ children }: DashboardAuthProps) {
  const { user, loading: authLoading } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if no user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      const redirectPath = location.pathname !== '/auth' ? location.pathname : '/';
      navigate(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [user, authLoading, navigate, location.pathname]);

  // Show loading or return null while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user exists but role is customer, show access denied
  if (userRole && userRole.role === 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <LogIn className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Ingen behörighet</CardTitle>
            <CardDescription>
              Du har inte behörighet att komma åt denna sida. Kontakta en administratör för åtkomst.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth')} 
              variant="outline"
              className="w-full"
            >
              Tillbaka till inloggning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated with appropriate role
  return <>{children}</>;
}