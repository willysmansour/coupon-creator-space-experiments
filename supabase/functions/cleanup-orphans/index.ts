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

interface Payload {
  dry_run?: boolean;
}

const headExists = async (url: string): Promise<boolean> => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch (_) {
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { dry_run = false }: Payload = await req.json().catch(() => ({ dry_run: false }));

    const { data: uploads, error } = await supabase
      .from('uploads')
      .select('id, image_url, customer_name');
    if (error) throw error;

    let checked = 0;
    let missing = 0;
    const removed: string[] = [];

    for (const u of uploads ?? []) {
      checked += 1;
      const exists = u.image_url ? await headExists(u.image_url) : false;
      if (!exists) {
        missing += 1;
        if (!dry_run) {
          // delete related coupons first
          await supabase.from('coupons').delete().eq('upload_id', u.id);
          // delete upload row
          await supabase.from('uploads').delete().eq('id', u.id);
        }
        removed.push(u.id);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      checked,
      missing,
      removed,
      dry_run
    }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } })
  }
}

serve(handler)


