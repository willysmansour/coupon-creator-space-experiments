import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Campaign {
  id: string;
  company_id: string;
  title: string;
  description?: string;
  discount: string;
  valid_from: string;
  valid_to: string;
  status: 'draft' | 'active' | 'ended';
  created_at: string;
  updated_at: string;
}

export interface Upload {
  id: string;
  campaign_id: string;
  customer_name?: string;
  customer_email?: string;
  image_url: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  upload_id: string;
  code: string;
  discount: string;
  expires_at: string;
  is_used: boolean;
  used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  created_at: string;
  updated_at: string;
}

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
    }
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
    enabled: !!id
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
    }
  });
};

export const useActiveCampaigns = (companyId?: string) => {
  return useQuery({
    queryKey: ['campaigns', 'active', companyId],
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Campaign[];
    }
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Campaign;
    },
    enabled: !!id
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
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data as Upload[];
    }
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
    enabled: !!id
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
    }
  });
};

export const useCoupon = (id: string) => {
  return useQuery({
    queryKey: ['coupon', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Coupon;
    },
    enabled: !!id
  });
};

export const useCouponByUpload = (uploadId: string) => {
  return useQuery({
    queryKey: ['coupon', 'upload', uploadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('upload_id', uploadId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Coupon | null;
    },
    enabled: !!uploadId
  });
};

// Mutation hooks
export const useCreateUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (upload: {
      campaign_id: string;
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
      const { data, error } = await supabase
        .from('coupons')
        .update({ 
          is_used: true, 
          used_at: new Date().toISOString() 
        })
        .eq('code', code)
        .eq('is_used', false)
        .select()
        .single();
      
      if (error) throw error;
      return data as Coupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon redeemed successfully!');
    },
    onError: (error) => {
      toast.error('Failed to redeem coupon: ' + error.message);
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
        .update({ 
          customer_name, 
          customer_email 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Upload;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.invalidateQueries({ queryKey: ['upload', data.id] });
      toast.success('Customer details saved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to save customer details: ' + error.message);
    }
  });
};

// File upload helper
export const uploadFile = async (file: File, bucket = 'uploads'): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
    
  return publicUrl;
};