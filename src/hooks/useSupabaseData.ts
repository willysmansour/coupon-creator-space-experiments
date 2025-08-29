import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Company, 
  Upload, 
  Coupon, 
  UserRole, 
  Customer, 
  Campaign, 
  CouponWithCompany,
  CompanyAwareCompany,
  RoleAssignmentData,
  CompanyUpdateData,
  ProfileUpdateData
} from '@/types';

// Optimized query options for better performance
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  refetchOnWindowFocus: false,
  refetchOnMount: true, // ✅ Fix: Always refetch on mount for mobile
  refetchOnReconnect: true, // ✅ Fix: Refetch on reconnect for mobile
  retry: (failureCount: number, error: any) => {
    // ✅ Fix: Retry on all errors for mobile compatibility
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

// Add back the missing useCoupon hook
export const useCoupon = (id: string) => {
  console.log('🔍 useCoupon called with ID:', id);
  
  return useQuery({
    queryKey: ['coupon', id],
    queryFn: async () => {
      console.log('🔍 useCoupon queryFn executing for ID:', id);
      
      // ✅ Fix: Add timeout for mobile compatibility
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - please try again')), 10000);
      });
      
      const supabasePromise = supabase
        .from('coupons')
        .select(`
          *,
          company:company_id (
            id,
            name,
            logo,
            discount_percentage
          )
        `)
        .eq('id', id)
        .single();
      
      try {
        const result = await Promise.race([supabasePromise, timeoutPromise]);
        const { data, error } = result as any;
        
        console.log('🔍 useCoupon Supabase result:', { data, error, id });
        
        if (error) {
          console.error('🔍 useCoupon Supabase error:', error);
          throw error;
        }
        
        console.log('🔍 useCoupon returning data:', data);
        return data as CouponWithCompany;
      } catch (error) {
        console.error('🔍 useCoupon error:', error);
        throw error;
      }
    },
    enabled: !!id,
    ...defaultQueryOptions,
  });
};

// User roles hook
export const useUserRole = () => {
  return useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { role: 'anon' as const };
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          role,
          company_id,
          companies(name)
        `)
        .eq('user_id', user.id)
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Role lookup error:', roleError);
      }

      if (roleData) {
        return {
          role: roleData.role,
          company_id: roleData.company_id,
          company_name: (roleData.companies as any)?.name,
          email: user.email,
        } as UserRole;
      }

      return { role: 'customer' as const, email: user.email };
    },
    enabled: true,
    retry: 1, // Reduced retry for auth queries
    staleTime: 2 * 60 * 1000, // 2 minutes for auth data
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
      toast.success('Upload submitted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to submit upload: ' + error.message);
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
    onSuccess: (data) => {
      // Optimize cache updates
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.invalidateQueries({ queryKey: ['upload', data.id] });
      toast.success(`Upload ${data.status} successfully!`);
    },
    onError: (error) => {
      toast.error('Failed to update upload: ' + error.message);
    }
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
      toast.success('Thank you! Your coupon has been redeemed.');
    },
    onError: (error) => {
      toast.error('Could not redeem the coupon: ' + error.message);
    }
  });
};

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
      // Optimize cache updates
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.invalidateQueries({ queryKey: ['upload', data.id] });
      toast.success('Customer details updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update customer details: ' + error.message);
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
    onSuccess: (id) => {
      // Optimize cache updates
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.removeQueries({ queryKey: ['upload', id] });
      toast.success('Upload deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete upload: ' + error.message);
    }
  });
};

// Profile hooks
export const useCurrentProfile = () => {
  return useQuery({
    queryKey: ['profile'],
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    }
  });
};

// Company management hooks
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CompanyUpdateData }) => {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Company;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', data.id] });
      toast.success('Company updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update company: ' + error.message);
    }
  });
};

// Company-aware data hooks
export const useCompanyAwareCompanies = () => {
  const { data: userRole } = useUserRole();
  
  return useQuery({
    queryKey: ['company-aware-companies', userRole?.company_id],
    queryFn: async () => {
      if (userRole?.role === 'super_admin') {
        // Super admin can see all companies
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as Company[];
      } else if (userRole?.company_id) {
        // Company admin can only see their own company
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', userRole.company_id);
        
        if (error) throw error;
        return data as Company[];
      }
      
      return [];
    },
    enabled: !!userRole,
    ...defaultQueryOptions,
  });
};

// Role assignment hook (super admin only)
export const useAssignRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role, companyId }: RoleAssignmentData) => {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role,
          company_id: companyId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      toast.success('Role assigned successfully!');
    },
    onError: (error) => {
      toast.error('Failed to assign role: ' + error.message);
    }
  });
};