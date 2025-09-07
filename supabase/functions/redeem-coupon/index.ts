// @ts-nocheck
/* eslint-disable */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const allowedOrigins = (Deno.env.get('APP_ALLOWED_ORIGINS') || '').split(',').map(o => o.trim()).filter(Boolean)
const getCorsHeaders = (origin?: string) => ({
  'Access-Control-Allow-Origin': origin && (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) ? origin : '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-origin',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
})
const isOriginAllowed = (req: Request) => {
  if (allowedOrigins.length === 0) return true
  const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || ''
  return !!origin && allowedOrigins.includes(origin)
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Optional safety checks (disabled by default to avoid breaking existing flows)
const ENFORCE_EXPIRY = (Deno.env.get('ENFORCE_COUPON_EXPIRY') || 'false').toLowerCase() === 'true'
const RATE_LIMIT_REDEEM = (Deno.env.get('RATE_LIMIT_REDEEM') || 'false').toLowerCase() === 'true'
const MAX_ATTEMPTS_PER_IP_MIN = parseInt(Deno.env.get('MAX_ATTEMPTS_PER_IP_MIN') || '20', 10)

// Best-effort in-memory limiter (non-persistent across instances)
const attemptCounts = new Map<string, { count: number; ts: number }>()
function rateLimit(ip: string) {
  if (!RATE_LIMIT_REDEEM) return true
  const now = Date.now()
  const key = ip || 'unknown'
  const rec = attemptCounts.get(key)
  if (!rec || now - rec.ts > 60_000) {
    attemptCounts.set(key, { count: 1, ts: now })
    return true
  }
  if (rec.count >= MAX_ATTEMPTS_PER_IP_MIN) return false
  rec.count += 1
  return true
}

interface RedeemRequest {
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
    return new Response(null, { headers: getCorsHeaders(origin) })
  }

  try {
    // Lightweight IP-based throttle
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || ''
    if (!rateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Too many attempts, please slow down' }), { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } })
    }

    if (!isOriginAllowed(req)) {
      const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || ''
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } })
    }

    const { code }: RedeemRequest = await req.json();
    if (!code || typeof code !== 'string') {
      const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
      return new Response(JSON.stringify({ error: 'Missing coupon code' }), { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders(origin) } })
    }

    // Find the coupon by code and not yet used
    const { data: coupon, error: findError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_used', false)
      .single();

    if (findError || !coupon) {
      const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
      return new Response(JSON.stringify({ error: 'Coupon not found or already used' }), { status: 404, headers: { "Content-Type": "application/json", ...getCorsHeaders(origin) } })
    }

    // Optional expiry enforcement
    if (ENFORCE_EXPIRY) {
      const nowIso = new Date().toISOString()
      if (coupon.expires_at && coupon.expires_at < nowIso) {
        return new Response(JSON.stringify({ error: 'Coupon expired' }), { status: 410, headers: { "Content-Type": "application/json", ...corsHeaders } })
      }
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

    const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
    return new Response(JSON.stringify({ success: true, coupon: updated }), { status: 200, headers: { "Content-Type": "application/json", ...getCorsHeaders(origin) } })
  } catch (e: any) {
    const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(origin) } })
  }
}

serve(handler)
