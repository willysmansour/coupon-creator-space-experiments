import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
)

interface EmailRequest {
  uploadId: string;
  customerName: string;
  customerEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { uploadId, customerName, customerEmail }: EmailRequest = await req.json();
    
    console.log('Processing email request for upload:', uploadId);

    // Get upload and company data
    const { data: upload, error: uploadError } = await supabase
      .from('uploads')
      .select('*, company_id')
      .eq('id', uploadId)
      .single();

    if (uploadError || !upload) {
      console.error('Upload not found:', uploadError);
      throw new Error('Upload not found');
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', upload.company_id)
      .single();

    if (companyError || !company) {
      console.error('Company not found:', companyError);
      throw new Error('Company not found');
    }

    // Check if coupon already exists
    let { data: existingCoupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('upload_id', uploadId)
      .single();

    // Create coupon if it doesn't exist and upload is approved
    if (!existingCoupon && upload.status === 'approved') {
      // Generate unique coupon code
      const couponCode = `SAVE${company.discount_percentage || 15}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Set expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { data: newCoupon, error: couponError } = await supabase
        .from('coupons')
        .insert({
          upload_id: uploadId,
          company_id: upload.company_id,
          code: couponCode,
          discount: `${company.discount_percentage || 15}%`,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (couponError) {
        console.error('Failed to create coupon:', couponError);
        throw new Error('Failed to create coupon');
      }

      existingCoupon = newCoupon;
      console.log('Created new coupon:', existingCoupon.id);
    }

    // Don't send email if upload is not approved yet
    if (upload.status !== 'approved' || !existingCoupon) {
      console.log('Upload not approved or no coupon, skipping email');
      return new Response(JSON.stringify({ 
        message: 'Upload not approved yet, email will be sent when approved',
        needsApproval: true 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create coupon URL
    const couponUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com') || 'https://your-domain.com'}/coupon/${existingCoupon.id}`;

    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: `${company.name} <onboarding@resend.dev>`,
      to: [customerEmail],
      subject: `Din kupong från ${company.name} är klar! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Din kupong är klar!</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            ${company.logo ? `<img src="${company.logo}" alt="${company.name}" style="max-width: 100px; height: auto; margin-bottom: 20px;">` : ''}
            <h1 style="color: #2563eb; margin: 0;">${company.name}</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hej ${customerName}! 👋</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Tack för ditt fantastiska bidrag! Vi har godkänt din bild och din kupong är nu klar att användas.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
              <h3 style="color: #16a34a; margin-top: 0;">🎉 Din kupong: ${existingCoupon.discount} rabatt</h3>
              <p style="font-size: 18px; font-weight: bold; color: #1e293b; margin: 10px 0;">
                Kupongkod: <span style="background: #fef3c7; padding: 4px 8px; border-radius: 4px;">${existingCoupon.code}</span>
              </p>
              <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
                Giltig till: ${new Date(existingCoupon.expires_at).toLocaleDateString('sv-SE')}
              </p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${couponUrl}" 
               style="background: #2563eb; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">
              Se min kupong 🎫
            </a>
          </div>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; font-size: 14px; color: #64748b;">
            <h4 style="color: #475569; margin-top: 0;">Så här använder du din kupong:</h4>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Visa kupongen i kassan när du handlar</li>
              <li>Kassapersonalen trycker på "Använd" knappen</li>
              <li>Du får ${existingCoupon.discount} rabatt på ditt köp!</li>
            </ol>
            <p style="margin-bottom: 0; font-style: italic;">
              Obs: Kupongen kan endast användas en gång och gäller i 30 dagar.
            </p>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p>Med vänliga hälsningar,<br><strong>${company.name}</strong></p>
            <p>Om du har frågor kan du kontakta oss eller besöka vår butik.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      couponId: existingCoupon.id,
      emailId: emailResponse.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-coupon-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);