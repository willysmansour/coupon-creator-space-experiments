import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingPage } from "@/components/ui/loading";

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          throw error;
        }

        if (isMounted) {
          const isAuth = !!session?.user;
          setAuthenticated(isAuth);
          setLoading(false);

          if (!isAuth) {
            const redirect = encodeURIComponent(location.pathname + location.search);
            navigate(`/auth?redirect=${redirect}`, { replace: true });
          }
        }
      } catch (error) {
        console.error('Failed to check authentication:', error);
        if (isMounted) {
          setLoading(false);
          setAuthenticated(false);
          navigate('/auth', { replace: true });
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isMounted) {
          const isAuth = !!session?.user;
          setAuthenticated(isAuth);
          setLoading(false);

          if (!isAuth && event !== 'SIGNED_OUT') {
            const redirect = encodeURIComponent(location.pathname + location.search);
            navigate(`/auth?redirect=${redirect}`, { replace: true });
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, location.search]);

  if (loading) {
    return fallback || <LoadingPage message="Verifierar inloggning..." />;
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
