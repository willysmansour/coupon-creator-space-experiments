import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        // Return default company_admin role instead of throwing
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
    enabled: true,
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });
};
