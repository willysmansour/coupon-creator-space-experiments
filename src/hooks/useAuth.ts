import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";

export type UserRole = 'super_admin' | 'company_admin' | 'customer';

export interface UserWithRole {
  id: string;
  email?: string;
  role: UserRole;
  company_id?: string;
  company_name?: string;
}

// Get current user's role and company information
export const useUserRole = () => {
  return useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select(`
          role,
          company_id,
          companies!left(name)
        `)
        .eq('user_id', user.id)
        .order('role', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      return {
        id: user.id,
        email: user.email,
        role: roleData?.role || 'customer',
        company_id: roleData?.company_id,
        company_name: roleData?.companies?.name
      } as UserWithRole;
    },
    enabled: true,
    retry: 1
  });
};

// Hook for authentication state
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
        
        // Invalidate user role query on auth changes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          queryClient.invalidateQueries({ queryKey: ['user-role'] });
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return { user, session, loading };
};

// Assign role to user (super admin only)
export const useAssignRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      role, 
      companyId 
    }: { 
      userId: string; 
      role: UserRole; 
      companyId?: string;
    }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role,
          company_id: companyId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      toast.success('Role assigned successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to assign role: ' + error.message);
    }
  });
};

// Generate various test email formats
const generateTestEmailFormats = () => {
  const timestamp = Date.now();
  return [
    `test.${timestamp}@gmail.com`,
    `testuser.${timestamp}@gmail.com`,
    `demo.${timestamp}@example.org`,
    `test+${timestamp}@example.com`
  ];
};

// Get user-friendly error messages
const getErrorMessage = (error: any): string => {
  if (error?.message?.includes('Email address is invalid')) {
    return "E-postadressen godkänns inte. Prova en annan e-postadress eller stäng av test-läge.";
  }
  if (error?.message?.includes('Password')) {
    return "Lösenordet uppfyller inte kraven. Använd minst 6 tecken.";
  }
  if (error?.message?.includes('already been taken')) {
    return "E-postadressen används redan. Prova logga in istället.";
  }
  return error?.message || "Ett oväntat fel uppstod vid registreringen";
};

// Create company and assign admin (for company registration)
export const useRegisterCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      email,
      password,
      companyName,
      logo
    }: {
      email: string;
      password: string;
      companyName: string;
      logo?: string;
    }) => {
      // Try different email formats if the first one fails
      const emailsToTry = email.includes('test+') || email.includes('test.') 
        ? generateTestEmailFormats() 
        : [email];

      let lastError: any;
      
      for (const tryEmail of emailsToTry) {
        try {
          // First create the auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: tryEmail,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/`
            }
          });

          if (authError) throw authError;
          if (!authData.user) throw new Error('User creation failed');

          // Create the company
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: companyName,
              logo,
              owner_user_id: authData.user.id
            })
            .select()
            .single();

          if (companyError) throw companyError;

          // Delete existing customer role first (if exists)
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', authData.user.id)
            .eq('role', 'customer');

          // Assign company admin role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: 'company_admin',
              company_id: companyData.id
            });

          if (roleError) throw roleError;

          return { user: authData.user, company: companyData };
        } catch (error) {
          lastError = error;
          console.log(`Email ${tryEmail} failed, trying next format...`);
          continue;
        }
      }
      
      // If all emails failed, throw the last error
      throw lastError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      toast.success('Company registered successfully! Please check your email for verification.');
    },
    onError: (error: any) => {
      const message = getErrorMessage(error);
      toast.error('Registration failed: ' + message);
    }
  });
};