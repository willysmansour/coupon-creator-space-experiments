import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

// Basic authentication state management
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle auth state changes with selective invalidation
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Only invalidate auth-related queries
          queryClient.invalidateQueries({ queryKey: ['user-role'] });
        } else if (event === 'SIGNED_OUT') {
          // Clear all queries and cache on sign out
          queryClient.clear();
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // If we have a session, invalidate user role only
      if (session?.user) {
        queryClient.invalidateQueries({ queryKey: ['user-role'] });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return { user, session, loading };
};
