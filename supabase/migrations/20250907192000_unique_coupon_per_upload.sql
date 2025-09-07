-- Ensure at most one coupon per upload
create unique index if not exists coupons_unique_upload on public.coupons (upload_id);

