import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BootstrapRequest {
  userId: string;
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = (await req.json()) as BootstrapRequest;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Check if any super admin exists
    const { data: existingAdmins, error: countErr } = await supabase
      .from("user_roles")
      .select("id", { count: "exact", head: false })
      .eq("role", "super_admin");

    if (countErr) throw countErr;

    const adminCount = existingAdmins?.length ?? 0;

    if (adminCount > 0) {
      return new Response(
        JSON.stringify({ assigned: false, reason: "Super admin already exists" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Assign super admin role to this first user
    const { error: insertErr } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "super_admin",
    });
    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({ assigned: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: any) {
    console.error("bootstrap-admin error", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
