// @ts-nocheck
/* eslint-disable */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload = await req.json();
    const company_id = payload.company_id as string;
    const customer_name = payload.customer_name as string;
    const customer_email = payload.customer_email as string;
    const path = payload.path as string;
    // Support both `message` and `review` keys; trim and default to empty string
    const text = ((payload.review ?? payload.message) ?? '').toString().trim();
    if (!company_id || !customer_name || !customer_email || !path) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);

    const { data: row, error } = await supabase
      .from('uploads')
      .insert({
        company_id,
        customer_name,
        customer_email,
        image_url: publicUrl,
        message: text,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify({ success: true, uploadId: row.id }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } })
  }
}

serve(handler)

