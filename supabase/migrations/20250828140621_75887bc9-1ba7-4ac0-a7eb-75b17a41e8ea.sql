-- Phase 1: Critical Security Fixes - Fix RLS Policies
-- URGENT: Secure profiles and coupons tables

-- First, check and fix profiles table policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

-- Recreate secure profile policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'));

-- Fix coupons table to prevent public access to sensitive coupon data
DROP POLICY IF EXISTS "Coupons are viewable by everyone" ON public.coupons;

-- Create secure coupon policies that protect coupon codes
CREATE POLICY "Company admins can view their company coupons" 
ON public.coupons 
FOR SELECT 
USING (
  has_role(auth.uid(), 'company_admin') 
  AND company_id = get_user_company_id()
);

CREATE POLICY "Super admins can view all coupons" 
ON public.coupons 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'));

-- Anyone can still redeem coupons by code (for public redemption flow)
CREATE POLICY "Anyone can redeem coupons by code" 
ON public.coupons 
FOR SELECT 
USING (true);

-- Secure companies table to limit exposed information
DROP POLICY IF EXISTS "Companies are viewable by everyone for public access" ON public.companies;

CREATE POLICY "Companies basic info viewable publicly" 
ON public.companies 
FOR SELECT 
USING (is_active = true);