import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/domains/auth';
import type { Campaign, Upload, Coupon, Company } from '@/types';

// Company-aware data hooks that filter based on user role and company

export const useCompanyAwareCompanies = () => {
  const { data: userRole } = useUserRole();
  
  return useQuery({
    queryKey: ['companies', userRole?.role, userRole?.company_id],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      // Company admins only see their own company
      if (userRole?.role === 'company_admin' && userRole.company_id) {
        query = query.eq('id', userRole.company_id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Company[];
    },
    enabled: !!userRole
  });
};

export const useCompanyAwareCampaigns = () => {
  const { data: userRole } = useUserRole();
  
  return useQuery({
    queryKey: ['campaigns', userRole?.role, userRole?.company_id],
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      // Company admins only see their campaigns
      if (userRole?.role === 'company_admin' && userRole.company_id) {
        query = query.eq('company_id', userRole.company_id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!userRole
  });
};

export const useCompanyAwareUploads = () => {
  const { data: userRole } = useUserRole();
  
  return useQuery({
    queryKey: ['uploads', userRole?.role, userRole?.company_id],
    queryFn: async () => {
      let query = supabase
        .from('uploads')
        .select('*')
        .order('submitted_at', { ascending: false });

      // Company admins only see uploads for their company
      if (userRole?.role === 'company_admin' && userRole.company_id) {
        query = query.eq('company_id', userRole.company_id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Upload[];
    },
    enabled: !!userRole
  });
};

export const useCompanyAwareCoupons = () => {
  const { data: userRole } = useUserRole();
  
  return useQuery({
    queryKey: ['coupons', userRole?.role, userRole?.company_id],
    queryFn: async () => {
      let query = supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      // Company admins only see coupons for their company
      if (userRole?.role === 'company_admin' && userRole.company_id) {
        query = query.eq('company_id', userRole.company_id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Coupon[];
    },
    enabled: !!userRole
  });
};
