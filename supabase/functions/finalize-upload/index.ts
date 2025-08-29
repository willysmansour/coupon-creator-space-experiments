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
    const { company_id, customer_name, customer_email, path, message } = await req.json();
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
        message: message || 'Uploaded content',
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


