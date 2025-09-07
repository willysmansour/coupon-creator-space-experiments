// @ts-nocheck
/* eslint-disable */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

interface EmailRequest {
  uploadId: string;
  customerName: string;
  customerEmail: string;
}

function randomUppercase(len: number) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < len; i++) {
    out += alphabet[bytes[i] % alphabet.length]
  }
  return out
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
    return new Response(null, { headers: getCorsHeaders(origin) });
  }

  try {
    if (!isOriginAllowed(req)) {
      const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || ''
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } })
    }

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
      // Generate stronger, non-guessable coupon code
      const couponCode = `SAVE${company.discount_percentage || 15}-${randomUppercase(8)}`;
      
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
      const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
      return new Response(JSON.stringify({ 
        message: 'Upload not approved yet, email will be sent when approved',
        needsApproval: true 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(origin) },
      });
    }

    // Create coupon URL using APP_BASE_URL or infer from request headers
    const appBaseEnv = (Deno.env.get('APP_BASE_URL') || '').trim();
    const originHeader = req.headers.get('x-app-origin') || req.headers.get('origin') || '';
    const hostHeader = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    const protoHeader = req.headers.get('x-forwarded-proto') || 'https';

    let baseUrl = '';
    if (appBaseEnv && appBaseEnv.startsWith('http')) {
      baseUrl = appBaseEnv;
    } else if (originHeader && originHeader.startsWith('http')) {
      baseUrl = originHeader;
    } else if (hostHeader) {
      baseUrl = `${protoHeader}://${hostHeader}`;
    }

    console.log('Resolved APP base URL for coupon links:', { baseUrl, appBaseEnv, originHeader, hostHeader, protoHeader });

    if (!baseUrl) {
      throw new Error('APP_BASE_URL is not configured and could not infer from request headers');
    }

    const couponUrl = `${baseUrl.replace(/\/+$/, '')}/coupon/${existingCoupon.id}`;

    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: `${company.name} <onboarding@resend.dev>`,
      to: [customerEmail],
      subject: `Your coupon from ${company.name} is ready! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your coupon is ready!</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            ${company.logo ? `<img src="${company.logo}" alt="${company.name}" style="max-width: 100px; height: auto; margin-bottom: 20px;">` : ''}
            <h1 style="color: #2563eb; margin: 0;">${company.name}</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${customerName}! 👋</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for your awesome contribution! We approved your upload and your coupon is ready to use.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 20px 0;">
              <h3 style="color: #16a34a; margin-top: 0;">🎉 Your coupon: ${existingCoupon.discount} off</h3>
              <p style="font-size: 18px; font-weight: bold; color: #1e293b; margin: 10px 0;">
                Coupon code: <span style="background: #fef3c7; padding: 4px 8px; border-radius: 4px;">${existingCoupon.code}</span>
              </p>
              <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
                Valid until: ${new Date(existingCoupon.expires_at).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${couponUrl}" 
               style="background: #2563eb; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">
              View my coupon 🎫
            </a>
          </div>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; font-size: 14px; color: #64748b;">
            <h4 style="color: #475569; margin-top: 0;">How to use your coupon:</h4>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Show the coupon at checkout when you purchase</li>
              <li>The cashier presses the "Redeem" button</li>
              <li>You get ${existingCoupon.discount} off your purchase!</li>
            </ol>
            <p style="margin-bottom: 0; font-style: italic;">
              Note: The coupon can be used once and is valid for 30 days.
            </p>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p>Best regards,<br><strong>${company.name}</strong></p>
            <p>If you have any questions, you can contact us or visit our store.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
    return new Response(JSON.stringify({ 
      success: true, 
      couponId: existingCoupon.id,
      emailId: emailResponse.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...getCorsHeaders(origin) },
    });

  } catch (error: any) {
    console.error("Error in send-coupon-email function:", error);
    const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(origin) },
      }
    );
  }
};

serve(handler);
