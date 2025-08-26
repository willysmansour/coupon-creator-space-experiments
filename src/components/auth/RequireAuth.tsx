import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function RequireAuth({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setAuthed(!!session?.user);
      setLoading(false);
      if (!session?.user) {
        const redirect = encodeURIComponent(location.pathname + location.search);
        navigate(`/auth?redirect=${redirect}`, { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session?.user);
      setLoading(false);
      if (!session?.user) {
        const redirect = encodeURIComponent(location.pathname + location.search);
        navigate(`/auth?redirect=${redirect}`, { replace: true });
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate, location]);

  if (loading) return null;
  if (!authed) return null;
  return <>{children}</>;
}
