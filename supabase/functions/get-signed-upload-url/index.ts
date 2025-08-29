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
    const { fileName, contentType } = await req.json();
    if (!fileName || !contentType) {
      return new Response(JSON.stringify({ error: 'Missing fileName or contentType' }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const ext = fileName.includes('.') ? fileName.split('.').pop() : 'bin';
    const objectPath = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .createSignedUploadUrl(objectPath);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify({
      path: objectPath,
      token: data?.token,
    }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } })
  }
}

serve(handler)


