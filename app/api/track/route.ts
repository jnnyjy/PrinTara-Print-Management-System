import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// NOTE: This route is intentionally unauthenticated — it serves the public
// live-queue display board and order status lookups for customers.
// It uses the admin client only because Supabase anon RLS may not permit
// public SELECT on these tables. Only non-sensitive display fields are
// returned — no customer names, no file paths, no payment data.

export async function GET() {
  const supabase = createAdminClient()

  const [requestsRes, jobsRes] = await Promise.all([
    supabase
      .from('job_requests')
      .select('order_code, status, quantity, paper_size, color_mode, created_at')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true }),
    supabase
      .from('jobs')
      .select('order_code, status, quantity, paper_size, color_mode, created_at')
      .in('status', ['RECEIVED', 'PRINTING', 'READY'])
      .order('created_at', { ascending: true }),
  ])

  if (requestsRes.error && jobsRes.error) {
    // M3 fix: never expose raw DB error details to the public
    console.error('[/api/track GET] Supabase error:', requestsRes.error, jobsRes.error)
    return NextResponse.json({ error: 'Unable to load the print queue.' }, { status: 500 })
  }

  const pendingRequests = (requestsRes.data ?? []).map((req) => ({
    orderCode: req.order_code,
    status: 'RECEIVED',
    quantity: req.quantity,
    paperSize: req.paper_size,
    colorMode: req.color_mode,
    createdAt: req.created_at,
  }))

  const activeJobs = (jobsRes.data ?? []).map((job) => ({
    orderCode: job.order_code,
    status: job.status,
    quantity: job.quantity,
    paperSize: job.paper_size,
    colorMode: job.color_mode,
    createdAt: job.created_at,
  }))

  return NextResponse.json({
    jobs: [...pendingRequests, ...activeJobs],
  })
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  // Input validation: must be a non-empty string, max 20 chars to prevent abuse
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).orderCode !== 'string'
  ) {
    return NextResponse.json({ error: 'Order code is required.' }, { status: 400 })
  }

  const rawCode = ((body as Record<string, unknown>).orderCode as string).trim().toUpperCase()

  if (!rawCode || rawCode.length > 20) {
    return NextResponse.json({ error: 'Order code is required.' }, { status: 400 })
  }

  // Only allow alphanumeric + dash to prevent any injection attempts
  if (!/^[A-Z0-9\-]+$/.test(rawCode)) {
    return NextResponse.json({ error: 'Invalid order code format.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('job_requests')
    .select('order_code, status, resulting_job_id, created_at')
    .eq('order_code', rawCode)
    .maybeSingle()

  if (error) {
    console.error('[/api/track POST] Supabase error:', error)
    return NextResponse.json({ error: 'Unable to look up your order. Please try again.' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'No matching order found. Check your order code.' }, { status: 404 })
  }

  let jobStatus: string | null = null
  if (data.resulting_job_id) {
    const { data: jobData } = await supabase
      .from('jobs')
      .select('status')
      .eq('id', data.resulting_job_id)
      .maybeSingle()

    jobStatus = jobData?.status ?? null
  }

  return NextResponse.json({
    orderCode: data.order_code,
    requestStatus: data.status,
    jobStatus,
    submittedAt: data.created_at,
  })
}
