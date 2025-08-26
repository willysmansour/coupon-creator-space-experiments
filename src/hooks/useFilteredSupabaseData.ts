import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useAuth';
import type { Upload, Coupon, Campaign, Company } from './useSupabaseData';

// Enhanced hooks that support super admin company filtering
export const useFilteredUploads = (selectedCompanyId?: string) => {
  const { data: userRole } = useUserRole();
  
  return useQuery({
    queryKey: ['uploads', 'filtered', userRole?.role, userRole?.company_id, selectedCompanyId],
    queryFn: async () => {
      let query = supabase
        .from('uploads')
        .select('*')
        .order('submitted_at', { ascending: false });

      // Apply filtering based on user role and selection
      if (userRole?.role === 'company_admin' && userRole.company_id) {
        // Company admins see only their company's uploads
        query = query.eq('company_id', userRole.company_id);
      } else if (userRole?.role === 'super_admin' && selectedCompanyId) {
        // Super admins can filter by selected company
        query = query.eq('company_id', selectedCompanyId);
      }
      // If super admin with no selection, show all uploads

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Upload[];
    },
    enabled: !!userRole
  });
};

export const useFilteredCoupons = (selectedCompanyId?: string) => {
  const { data: userRole } = useUserRole();
  
  return useQuery({
    queryKey: ['coupons', 'filtered', userRole?.role, userRole?.company_id, selectedCompanyId],
    queryFn: async () => {
      let query = supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filtering based on user role and selection
      if (userRole?.role === 'company_admin' && userRole.company_id) {
        // Company admins see only their company's coupons
        query = query.eq('company_id', userRole.company_id);
      } else if (userRole?.role === 'super_admin' && selectedCompanyId) {
        // Super admins can filter by selected company
        query = query.eq('company_id', selectedCompanyId);
      }
      // If super admin with no selection, show all coupons

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Coupon[];
    },
    enabled: !!userRole
  });
};

export const useFilteredCampaigns = (selectedCompanyId?: string) => {
  const { data: userRole } = useUserRole();
  
  return useQuery({
    queryKey: ['campaigns', 'filtered', userRole?.role, userRole?.company_id, selectedCompanyId],
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filtering based on user role and selection
      if (userRole?.role === 'company_admin' && userRole.company_id) {
        // Company admins see only their company's campaigns
        query = query.eq('company_id', userRole.company_id);
      } else if (userRole?.role === 'super_admin' && selectedCompanyId) {
        // Super admins can filter by selected company
        query = query.eq('company_id', selectedCompanyId);
      }
      // If super admin with no selection, show all campaigns

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!userRole
  });
};