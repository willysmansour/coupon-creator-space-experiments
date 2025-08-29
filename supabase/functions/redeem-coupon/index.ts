// @ts-nocheck
/* eslint-disable */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-app-origin",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface RedeemRequest {
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { code }: RedeemRequest = await req.json();
    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing coupon code' }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } })
    }

    // Find the coupon by code and not yet used
    const { data: coupon, error: findError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_used', false)
      .single();

    if (findError || !coupon) {
      return new Response(JSON.stringify({ error: 'Coupon not found or already used' }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } })
    }

    const { data: updated, error: updateError } = await supabase
      .from('coupons')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', coupon.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true, coupon: updated }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } })
  }
}

serve(handler)


