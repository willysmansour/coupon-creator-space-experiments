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

  // If user exists but role is customer and they don't have a company, help them complete registration
  if (userRole && userRole.role === 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <LogIn className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Slutför din registrering</CardTitle>
            <CardDescription>
              Ditt konto är skapat, men du behöver slutföra företagsregistreringen för att komma åt dashboarden.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/auth?redirect=' + encodeURIComponent(location.pathname))} 
              className="w-full"
            >
              Registrera företag
            </Button>
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