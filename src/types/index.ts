// Core data types for the application
export interface Company {
  id: string;
  name: string;
  logo?: string;
  discount_percentage?: number;
  content_types?: string[];
  content_description?: string;
  discount_active?: boolean;
  discount_expires_at?: string;
  is_active?: boolean;
  owner_user_id?: string;
  qr_code_url?: string;
  qr_code_created_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Upload {
  id: string;
  company_id: string;
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

export interface UserRole {
  role: 'super_admin' | 'company_admin' | 'customer' | 'anon';
  company_id?: string;
  company_name?: string;
  email?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Customer interface for the Customers page
export interface Customer {
  id: string;
  name: string;
  email: string;
  totalSubmissions: number;
  totalCoupons: number;
  status: 'active' | 'inactive' | 'vip';
  joinDate: string;
  lastActivity: string;
  avatar: string;
}

// Campaign interface
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

// Coupon with company info
export interface CouponWithCompany extends Coupon {
  company: {
    id: string;
    name: string;
    logo?: string;
    discount_percentage?: number;
  };
}

// Company-aware companies for different user roles
export interface CompanyAwareCompany extends Company {
  // Additional fields if needed
}

// Form data types
export interface UploadFormData {
  company_id: string;
  customer_name?: string;
  customer_email?: string;
  image_url: string;
  message?: string;
}

export interface CompanyUpdateData {
  name?: string;
  logo?: string;
  discount_percentage?: number;
  content_types?: string[];
  content_description?: string;
  discount_active?: boolean;
  discount_expires_at?: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  avatar_url?: string;
}

// Role assignment data
export interface RoleAssignmentData {
  userId: string;
  role: 'super_admin' | 'company_admin' | 'customer';
  companyId?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
