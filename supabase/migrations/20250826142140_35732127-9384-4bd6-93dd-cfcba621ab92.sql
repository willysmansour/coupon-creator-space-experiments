-- Add discount and content settings to companies table
ALTER TABLE public.companies 
ADD COLUMN discount_percentage INTEGER DEFAULT 10,
ADD COLUMN content_types TEXT[] DEFAULT ARRAY['photo', 'video'],
ADD COLUMN content_description TEXT,
ADD COLUMN discount_active BOOLEAN DEFAULT true,
ADD COLUMN discount_expires_at TIMESTAMP WITH TIME ZONE;

-- Update uploads table to remove campaign dependency and make it simpler
ALTER TABLE public.uploads 
DROP COLUMN campaign_id,
ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Update coupons table to reference company instead of campaign
ALTER TABLE public.coupons
DROP COLUMN IF EXISTS campaign_id,
ADD COLUMN company_id UUID REFERENCES public.companies(id);