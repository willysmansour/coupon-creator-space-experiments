-- Create policy to allow anyone to redeem coupons (mark them as used)
CREATE POLICY "Anyone can redeem coupons" ON "public"."coupons"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (is_used = true);