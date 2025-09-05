-- Add performance indexes for frequently queried columns
-- This will significantly improve query performance

-- Index for user_roles table
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_company_id ON public.user_roles(company_id) WHERE company_id IS NOT NULL;

-- Index for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id) WHERE company_id IS NOT NULL;

-- Index for companies table
CREATE INDEX IF NOT EXISTS idx_companies_owner_user_id ON public.companies(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON public.companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON public.companies(created_at DESC);

-- Index for uploads table
CREATE INDEX IF NOT EXISTS idx_uploads_company_id ON public.uploads(company_id);
CREATE INDEX IF NOT EXISTS idx_uploads_customer_email ON public.uploads(customer_email);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON public.uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON public.uploads(status);

-- Index for coupons table
CREATE INDEX IF NOT EXISTS idx_coupons_company_id ON public.coupons(company_id);
CREATE INDEX IF NOT EXISTS idx_coupons_upload_id ON public.coupons(upload_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_used ON public.coupons(is_used);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON public.coupons(created_at DESC);

-- Index for campaigns table
CREATE INDEX IF NOT EXISTS idx_campaigns_company_id ON public.campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON public.campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON public.campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_end_date ON public.campaigns(end_date);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_roles_user_company ON public.user_roles(user_id, company_id);
CREATE INDEX IF NOT EXISTS idx_coupons_company_used ON public.coupons(company_id, is_used);
CREATE INDEX IF NOT EXISTS idx_uploads_company_status ON public.uploads(company_id, status);

-- Partial indexes for better performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_companies_active_only ON public.companies(id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupons_unused_only ON public.coupons(id, code) WHERE is_used = false;
CREATE INDEX IF NOT EXISTS idx_campaigns_active_only ON public.campaigns(id) WHERE is_active = true;

-- Add index for auth.users email (if not exists)
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);

-- Analyze tables to update statistics after adding indexes
ANALYZE public.user_roles;
ANALYZE public.profiles;
ANALYZE public.companies;
ANALYZE public.uploads;
ANALYZE public.coupons;
ANALYZE public.campaigns;
