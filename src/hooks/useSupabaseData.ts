import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/lib/notify';
import type {
  Upload,
  Coupon,
  CouponWithCompany,
  Company,
  Profile,
  ProfileUpdateData,
  Campaign
} from '@/types';

// Optimized query options for better performance
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  refetchOnWindowFocus: false,
  refetchOnMount: true, // Always refetch on mount for mobile
  refetchOnReconnect: true, // Refetch on reconnect for mobile
  retry: (failureCount: number, error: any) => {
    // Retry on all errors for mobile compatibility
    if (failureCount >= 3) return false; // Max 3 retries
    return true; // Always retry for mobile compatibility
  },
};

// Companies hooks
export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Company[];
    },
    ...defaultQueryOptions,
  });
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Company;
    },
    enabled: !!id,
    ...defaultQueryOptions,
  });
};

// Campaigns hooks
export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Campaign[];
    },
    ...defaultQueryOptions,
  });
};

// Uploads hooks
export const useUploads = () => {
  return useQuery({
    queryKey: ['uploads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Upload[];
    },
    ...defaultQueryOptions,
  });
};

export const useFilteredUploads = (companyId?: string) => {
  return useQuery({
    queryKey: ['filtered-uploads', companyId],
    queryFn: async () => {
      let query = supabase
        .from('uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Upload[];
    },
    enabled: true,
    ...defaultQueryOptions,
  });
};

export const useUpload = (id: string) => {
  return useQuery({
    queryKey: ['upload', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Upload;
    },
    enabled: !!id,
    ...defaultQueryOptions,
  });
};

// Coupons hooks
export const useCoupons = () => {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Coupon[];
    },
    ...defaultQueryOptions,
  });
};

// Add back the missing useCoupon hook
export const useCoupon = (id: string) => {
  return useQuery({
    queryKey: ['coupon', id],
    queryFn: async () => {
      // Add timeout for mobile compatibility
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - please try again')), 10000);
      });
      
      // Use simple query that works with RLS
      const supabasePromise = supabase
        .from('coupons')
        .select('*')
        .eq('id', id)
        .single();
      
      try {
        const result = await Promise.race([supabasePromise, timeoutPromise]);
        const { data, error } = result as any;
        
        if (error) {
          // Better error messages for mobile
          if (error.code === 'PGRST116') {
            throw new Error('Coupon not found');
          } else if (error.message?.includes('fetch')) {
            throw new Error('Network error - please check your connection');
          } else if (error.message?.includes('timeout')) {
            throw new Error('Request timeout - please try again');
          } else {
            throw new Error(`Database error: ${error.message}`);
          }
        }
        
        // Get company data separately if needed
        let companyData = null;
        if (data && data.company_id) {
          try {
            const { data: company, error: companyError } = await supabase
              .from('companies')
              .select('id, name, logo, discount_percentage')
              .eq('id', data.company_id)
              .single();
            
            if (!companyError && company) {
              companyData = company;
            }
          } catch (companyError) {
            console.warn('Could not fetch company data:', companyError);
            // Don't fail the whole request if company data fails
          }
        }
        
        // Combine coupon and company data
        const couponWithCompany = {
          ...data,
          company: companyData
        };
        
        return couponWithCompany as CouponWithCompany;
      } catch (error) {
        console.error('useCoupon error:', error);
        throw error;
      }
    },
    enabled: !!id,
    ...defaultQueryOptions,
  });
};

// File upload function
export const uploadFile = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(fileName);

  return publicUrl;
};

// Mutation hooks
export const useCreateUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (upload: {
      company_id: string;
      customer_name?: string;
      customer_email?: string;
      image_url: string;
      message?: string;
    }) => {
      const { data, error } = await supabase
        .from('uploads')
        .insert(upload)
        .select()
        .single();
        
        if (error) throw error;
        return data as Upload;
    },
    onSuccess: () => {
      // Optimize cache invalidation
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      notify.success('Upload submitted successfully!');
    },
    onError: (error) => {
      notify.error('Failed to submit upload: ' + error.message);
    }
  });
};

export const useUpdateUploadStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const updateData: any = { status };
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else if (status === 'rejected') {
        updateData.rejected_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('uploads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
        if (error) throw error;
        return data as Upload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.invalidateQueries({ queryKey: ['filtered-uploads'] });
      notify.success('Upload status updated successfully!');
    },
    onError: (error) => {
      notify.error('Failed to update upload status: ' + error.message);
    }
  });
};

export const useDeleteUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('uploads')
        .delete()
        .eq('id', id);
        
        if (error) throw error;
        return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.invalidateQueries({ queryKey: ['filtered-uploads'] });
      notify.success('Upload deleted successfully!');
    },
    onError: (error) => {
      notify.error('Failed to delete upload: ' + error.message);
    }
  });
};

// Company-aware data hooks
export const useCompanyAwareCompanies = () => {
  return useQuery({
    queryKey: ['company-aware-companies'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get user role first
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, company_id')
        .eq('user_id', user.id)
        .single();

      let query = supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (roleData?.role === 'company_admin' && roleData.company_id) {
        // Company admin can only see their own company
        query = query.eq('id', roleData.company_id);
      }
      // Super admin can see all companies (no filter)

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Company[];
    },
    enabled: true,
    ...defaultQueryOptions,
  });
};

// Profile management hooks
export const useCurrentProfile = () => {
  return useQuery({
    queryKey: ['current-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: true,
    ...defaultQueryOptions,
  });
};

export const useUpsertProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: ProfileUpdateData) => {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profile)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["current-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-role"] }); // Invalidate user-role
      
      // Update cache directly for immediate UI update
      queryClient.setQueryData(["current-profile"], data);
    },
    onError: (error) => {
      notify.error('Failed to update profile: ' + error.message);
    }
  });
};

// Company update hooks
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (companyData: { id?: string; name: string; logo?: string }) => {
      const { data, error } = await supabase
        .from('companies')
        .upsert(companyData)
        .select()
        .single();
        
        if (error) throw error;
        return data as Company;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company-aware-companies"] });
      queryClient.invalidateQueries({ queryKey: ["user-role"] }); // Invalidate user-role
      
      // Update cache directly for immediate UI update
      queryClient.setQueryData(["companies"], (oldData: any) => {
        if (oldData) {
          return oldData.map((company: any) => 
            company.id === data.id ? data : company
          );
        }
        return [data];
      });
    },
    onError: (error) => {
      notify.error('Failed to update company: ' + error.message);
    }
  });
};

// Upload management hooks
export const useUpdateUploadWithCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, customer_name, customer_email }: { 
      id: string; 
      customer_name: string; 
      customer_email: string; 
    }) => {
      const { data, error } = await supabase
        .from('uploads')
        .update({ customer_name, customer_email })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Upload;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.invalidateQueries({ queryKey: ['upload', data.id] });
      notify.success('Customer details updated successfully!');
    },
    onError: (error) => {
      notify.error('Failed to update customer details: ' + error.message);
    }
  });
};

// Coupon management hooks
export const useCouponByUpload = (uploadId: string) => {
  return useQuery({
    queryKey: ['coupon-by-upload', uploadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('upload_id', uploadId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data as Coupon | null;
    },
    enabled: !!uploadId,
    ...defaultQueryOptions,
  });
};

export const useRedeemCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (code: string) => {
      // Use secure Edge Function to redeem to avoid exposing table writes
      const { data, error } = await supabase.functions.invoke('redeem-coupon', {
        body: { code }
      });
      if (error) throw error;
      return (data?.coupon ?? null) as Coupon;
    },
    onSuccess: (data) => {
      // Optimize cache invalidation
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['coupon', data.id] });
      }
      notify.success('Thank you! Your coupon has been redeemed.');
    },
    onError: (error) => {
      notify.error('Could not redeem the coupon: ' + error.message);
    }
  });
};
