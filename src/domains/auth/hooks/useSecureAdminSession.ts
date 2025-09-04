import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SUPERADMIN_EMAIL } from "@/config/constants";

interface AdminSession {
  isAuthenticated: boolean;
  userEmail: string | null;
  sessionExpiry: number | null;
}

// Secure admin session management without localStorage
export const useSecureAdminSession = () => {
  const [adminSession, setAdminSession] = useState<AdminSession>({
    isAuthenticated: false,
    userEmail: null,
    sessionExpiry: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check if current Supabase session is valid superadmin
  const validateAdminSession = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return false;
      
      // Check if user email matches superadmin
      if (session.user.email?.toLowerCase() !== SUPERADMIN_EMAIL.toLowerCase()) {
        return false;
      }
      
      // Check if session is not expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        return false;
      }
      
      // Verify user has super_admin role in database
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'super_admin')
        .single();
        
      if (error || !roleData) return false;
      
      return true;
    } catch (error) {
      console.error('Admin session validation failed:', error);
      return false;
    }
  };

  // Initialize session check on mount
  useEffect(() => {
    const initSession = async () => {
      const isValid = await validateAdminSession();
      
      if (isValid) {
        const { data: { session } } = await supabase.auth.getSession();
        setAdminSession({
          isAuthenticated: true,
          userEmail: session?.user?.email ?? null,
          sessionExpiry: session?.expires_at ?? null
        });
      } else {
        setAdminSession({
          isAuthenticated: false,
          userEmail: null,
          sessionExpiry: null
        });
      }
      
      setIsLoading(false);
    };

    initSession();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setAdminSession({
            isAuthenticated: false,
            userEmail: null,
            sessionExpiry: null
          });
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Validate new session
          const isValid = await validateAdminSession();
          setAdminSession({
            isAuthenticated: isValid,
            userEmail: isValid ? (session.user.email ?? null) : null,
            sessionExpiry: isValid ? (session.expires_at ?? null) : null
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Sign out any existing session
      await supabase.auth.signOut();
      
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user && email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
        const isValid = await validateAdminSession();
        
        if (isValid) {
          setAdminSession({
            isAuthenticated: true,
            userEmail: data.user.email ?? null,
            sessionExpiry: data.session?.expires_at ?? null
          });
          return true;
        }
      }
      
      // Not a valid superadmin login
      await supabase.auth.signOut();
      return false;
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAdminSession({
      isAuthenticated: false,
      userEmail: null,
      sessionExpiry: null
    });
  };

  return {
    ...adminSession,
    isLoading,
    login,
    logout,
    validateSession: validateAdminSession
  };
};
