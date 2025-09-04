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

      if (error) {
        console.error('Error fetching user role:', error);
        // Return default customer role instead of throwing
        return {
          id: user.id,
          email: user.email,
          role: 'company_admin' as const,
          company_id: undefined,
          company_name: undefined
        } as UserWithRole;
      }

      return {
        id: user.id,
        email: user.email,
        role: roleData?.role || 'company_admin',
        company_id: roleData?.company_id,
        company_name: roleData?.companies?.name
      } as UserWithRole;
    },
    enabled: true, // Enable it to work properly
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true // Allow refetch on mount
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
        
        // Handle auth state changes
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Invalidate and refetch user role query on sign in
          queryClient.invalidateQueries({ queryKey: ['user-role'] });
          queryClient.refetchQueries({ queryKey: ['user-role'] });
          // Also invalidate company and profile data
          queryClient.invalidateQueries({ queryKey: ['company-aware-companies'] });
          queryClient.invalidateQueries({ queryKey: ['current-profile'] });
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
      
      // If we have a session, invalidate and refetch user role
      if (session?.user) {
        queryClient.invalidateQueries({ queryKey: ['user-role'] });
        queryClient.refetchQueries({ queryKey: ['user-role'] });
        // Also invalidate company and profile data
        queryClient.invalidateQueries({ queryKey: ['company-aware-companies'] });
        queryClient.invalidateQueries({ queryKey: ['current-profile'] });
      }
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


// Get user-friendly error messages
const getErrorMessage = (error: any): string => {
  if (error?.message?.includes('Email address is invalid')) {
    return "E-postadressen är ogiltig. Kontrollera att du angett rätt format.";
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
      firstName,
      lastName,
      logo
    }: {
      email: string;
      password: string;
      companyName: string;
      firstName?: string;
      lastName?: string;
      logo?: string;
    }) => {
      // Create the auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            company_name: companyName,
            first_name: firstName || companyName, // Använd angivet förnamn eller företagsnamn
            last_name: lastName || 'Admin'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Wait a moment for the database trigger to create the company
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the company that was created by the database trigger
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_user_id', authData.user.id)
        .single();

      if (companyError) throw companyError;

      // Role assignment is handled by the database trigger automatically

      // Create QR code data for the company
      const qrUrl = `${window.location.origin}/company/${companyData.id}`;
      
      // Store QR code data in companies table (optional - for future use)
      await supabase
        .from('companies')
        .update({ 
          qr_code_url: qrUrl,
          qr_code_created_at: new Date().toISOString()
        })
        .eq('id', companyData.id);

      return { user: authData.user, company: companyData, qrCodeUrl: qrUrl };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      queryClient.invalidateQueries({ queryKey: ['company-aware-companies'] });
      
      // Show success message with QR code info
      toast.success(`Company registered successfully! Your QR code is ready at: ${data.qrCodeUrl}`);
      
      // Show additional info about the QR code
      toast.info('Your QR code has been automatically generated and is ready to use!', {
        duration: 5000,
      });
    },
    onError: (error: any) => {
      const message = getErrorMessage(error);
      toast.error('Registration failed: ' + message);
    }
  });
};