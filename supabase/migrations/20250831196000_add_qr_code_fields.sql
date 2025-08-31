-- Add QR code fields to companies table
ALTER TABLE public.companies 
ADD COLUMN qr_code_url TEXT,
ADD COLUMN qr_code_created_at TIMESTAMP WITH TIME ZONE;

-- Add index for QR code URL lookups
CREATE INDEX idx_companies_qr_code_url ON public.companies(qr_code_url);

-- Update existing companies with QR code URLs
UPDATE public.companies 
SET 
  qr_code_url = CONCAT('https://coupon-creator-space-experiments.vercel.app/company/', id),
  qr_code_created_at = created_at
WHERE qr_code_url IS NULL;
