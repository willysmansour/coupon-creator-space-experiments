-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount TEXT NOT NULL,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create uploads table
CREATE TABLE public.uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_email TEXT,
  image_url TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  discount TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (this is a public UGC platform)
CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Active campaigns are viewable by everyone" ON public.campaigns FOR SELECT USING (status = 'active');
CREATE POLICY "Uploads are viewable by everyone" ON public.uploads FOR SELECT USING (true);
CREATE POLICY "Coupons are viewable by everyone" ON public.coupons FOR SELECT USING (true);

-- Allow public uploads (customers don't need accounts)
CREATE POLICY "Anyone can create uploads" ON public.uploads FOR INSERT WITH CHECK (true);

-- Admin-only policies for management (will need auth later)
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL USING (false);
CREATE POLICY "Admins can manage campaigns" ON public.campaigns FOR ALL USING (false);
CREATE POLICY "Admins can manage uploads" ON public.uploads FOR UPDATE USING (false);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (false);

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Create storage policies
CREATE POLICY "Upload images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Anyone can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');

-- Create indexes for performance
CREATE INDEX idx_campaigns_company_id ON public.campaigns(company_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_uploads_campaign_id ON public.uploads(campaign_id);
CREATE INDEX idx_uploads_status ON public.uploads(status);
CREATE INDEX idx_coupons_upload_id ON public.coupons(upload_id);
CREATE INDEX idx_coupons_code ON public.coupons(code);

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_uploads_updated_at BEFORE UPDATE ON public.uploads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.companies (id, name, logo) VALUES 
('123e4567-e89b-12d3-a456-426614174000', 'ACME Corp', 'https://via.placeholder.com/200x100');

INSERT INTO public.campaigns (company_id, title, description, discount, valid_from, valid_to, status) VALUES 
('123e4567-e89b-12d3-a456-426614174000', 'Sommarkampanj 2024', 'Ladda upp din bästa sommarbild och få rabatt!', '20% rabatt', now(), now() + interval '30 days', 'active'),
('123e4567-e89b-12d3-a456-426614174000', 'Vinter Special', 'Visa oss din vinterstämning', '15% rabatt', now() - interval '10 days', now() + interval '20 days', 'active');