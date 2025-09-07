// @ts-nocheck
/* eslint-disable */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Derive allowed origins from env. If not set, fall back to '*'.
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

// Optional, disabled-by-default validations controlled by env vars to avoid breaking current flows
const STRICT_UPLOAD_VALIDATION = (Deno.env.get('STRICT_UPLOAD_VALIDATION') || 'false').toLowerCase() === 'true'
const VALIDATE_COMPANY_ID = (Deno.env.get('VALIDATE_COMPANY_ID') || 'false').toLowerCase() === 'true'
const MAX_UPLOAD_SIZE_MB = parseInt(Deno.env.get('MAX_UPLOAD_SIZE_MB') || '20', 10)
const ALLOWED_MIME_LIST = (Deno.env.get('ALLOWED_MIME_LIST') || 'image/jpeg,image/png,image/webp,video/mp4')
  .split(',')
  .map(s => s.trim().toLowerCase())

function validateFileSoft(file: File) {
  // Soft validation: only enforce when STRICT_UPLOAD_VALIDATION is true
  if (!STRICT_UPLOAD_VALIDATION) return { ok: true as const }

  const sizeMb = file.size / (1024 * 1024)
  if (sizeMb > MAX_UPLOAD_SIZE_MB) {
    return { ok: false as const, error: `File too large (>${MAX_UPLOAD_SIZE_MB}MB)` }
  }
  const type = (file.type || '').toLowerCase()
  if (type && !ALLOWED_MIME_LIST.includes(type)) {
    return { ok: false as const, error: `Unsupported file type: ${type}` }
  }
  return { ok: true as const }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
    return new Response('ok', { headers: getCorsHeaders(origin) })
  }

  try {
    // Basic origin check
    if (!isOriginAllowed(req)) {
      const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || ''
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } })
    }

    // Parse the request body
    const formData = await req.formData()
    const file = formData.get('file') as File
    const companyId = formData.get('companyId') as string
    const customerName = formData.get('customerName') as string
    const customerEmail = formData.get('customerEmail') as string
    // Accept both 'review' and 'message' keys from clients
    const rawReview = formData.get('review') ?? formData.get('message')
    const review = (rawReview ? String(rawReview) : '').trim()

    if (!file || !companyId || !customerName || !customerEmail) {
      const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } })
    }

    // Optional file validation
    const fileCheck = validateFileSoft(file)
    if (!fileCheck.ok) {
      const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
      return new Response(JSON.stringify({ error: fileCheck.error }), { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } })
    }

    // Initialize Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Initialize Supabase client with service role (bypasses RLS)
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
      return new Response(JSON.stringify({ error: 'Failed to upload file' }), { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName)

    // Optionally validate that the company exists before inserting
    if (VALIDATE_COMPANY_ID) {
      const { data: companyExists, error: companyErr } = await supabase
        .from('companies')
        .select('id')
        .eq('id', companyId)
        .maybeSingle()
      if (companyErr || !companyExists) {
        // Clean up uploaded file if company invalid
        await supabase.storage.from('uploads').remove([fileName])
        const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
        return new Response(JSON.stringify({ error: 'Invalid company' }), { status: 400, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } })
      }
    }

    // Create upload record in database (bypasses RLS)
    const { data: dbUpload, error: dbError } = await supabase
      .from('uploads')
      .insert({
        company_id: companyId,
        customer_name: customerName,
        customer_email: customerEmail,
        image_url: publicUrl,
        message: review, // empty string if no review provided
        status: 'pending'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('uploads').remove([fileName])
      return new Response(
        JSON.stringify({ error: 'Failed to create upload record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
    return new Response(JSON.stringify({ success: true, upload: dbUpload, message: 'Upload successful' }), { status: 200, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Unexpected error:', error)
    const origin = req.headers.get('origin') || req.headers.get('x-app-origin') || '*'
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } })
  }
})
