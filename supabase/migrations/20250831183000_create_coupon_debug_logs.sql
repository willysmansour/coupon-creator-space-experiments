-- Create debug logging table for coupon attempts
CREATE TABLE IF NOT EXISTS public.coupon_debug_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES public.coupons(id),
  user_agent TEXT,
  url TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  error TEXT,
  success BOOLEAN,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on the debug table
ALTER TABLE public.coupon_debug_logs ENABLE ROW LEVEL SECURITY;

-- Allow super admins to view all logs
CREATE POLICY "Super admins can view all debug logs" 
ON public.coupon_debug_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'));

-- Allow company admins to view logs for their coupons
CREATE POLICY "Company admins can view debug logs for their coupons" 
ON public.coupon_debug_logs 
FOR SELECT 
USING (
  has_role(auth.uid(), 'company_admin') 
  AND coupon_id IN (
    SELECT id FROM public.coupons 
    WHERE company_id = get_user_company_id()
  )
);

-- Allow anyone to insert logs (for debugging)
CREATE POLICY "Anyone can insert debug logs" 
ON public.coupon_debug_logs 
FOR INSERT 
WITH CHECK (true);
