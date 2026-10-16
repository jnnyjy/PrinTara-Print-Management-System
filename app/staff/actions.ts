'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRoleFromEmail } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export type AcceptState = {
  success: boolean
  message: string
  receipt?: {
    orderCode: string
    price: number
    amountReceived: number
    change: number
  }
}

// C2 fix: allowlist of valid job statuses
const ALLOWED_STATUSES = new Set(['RECEIVED', 'PRINTING', 'READY', 'COMPLETED'])

// H2 fix: cryptographically random order code
function generateOrderCode(prefix: string, digits: number): string {
  const max = Math.pow(10, digits)
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const num = array[0] % max
  return `${prefix}${num.toString().padStart(digits, '0')}`
}

// M3 fix: never return raw DB error messages to the client
function safeError(msg: string): string {
  if (process.env.NODE_ENV === 'development') return msg
  return 'An unexpected error occurred. Please try again.'
}

export async function acceptJobRequest(
  prevState: AcceptState,
  formData: FormData
): Promise<AcceptState> {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  const supabase = createAdminClient()

  if (!user) {
    return { success: false, message: 'Not authenticated.' }
  }

  // Both staff and owner can accept requests
  const role = getRoleFromEmail(user.email)
  if (role !== 'staff' && role !== 'owner') {
    return { success: false, message: 'Not authorized.' }
  }

  const requestId = formData.get('requestId') as string
  const price = parseFloat(formData.get('price') as string)
  const amountReceived = parseFloat(formData.get('amountReceived') as string)

  if (!requestId || !Number.isFinite(price) || price < 0 || !Number.isFinite(amountReceived)) {
    return { success: false, message: 'Please enter a valid price.' }
  }

  if (amountReceived < price) {
    return { success: false, message: 'Amount received cannot be less than the price.' }
  }

  const { data: request, error: requestError } = await supabase
    .from('job_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (requestError || !request) {
    return { success: false, message: 'Request not found.' }
  }

  const jobId = crypto.randomUUID()
  const orderCode = generateOrderCode('PRT-', 7)

  const { error: jobError } = await supabase.from('jobs').insert({
    id: jobId,
    order_code: orderCode,
    paper_size: request.paper_size,
    color_mode: request.color_mode,
    quantity: request.quantity,
    notes: request.notes,
    price,
    status: 'PRINTING',
    created_by: user.id,
  })

  if (jobError) {
    return { success: false, message: safeError(jobError.message) }
  }

  const { error: paymentError } = await supabase.from('payments').insert({
    job_id: jobId,
    amount: price,
    method: 'COD',
    status: 'PAID',
    amount_received: amountReceived,
    change_amount: amountReceived - price,
    paid_at: new Date().toISOString(),
  })

  if (paymentError) {
    await supabase.from('jobs').delete().eq('id', jobId)
    return { success: false, message: safeError(paymentError.message) }
  }

  const { data: updatedRequest, error: updateError } = await supabase
    .from('job_requests')
    .update({
      status: 'ACCEPTED',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      resulting_job_id: jobId,
    })
    .eq('id', requestId)
    .eq('status', 'PENDING')
    .select()
    .maybeSingle()

  if (updateError || !updatedRequest) {
    await supabase.from('payments').delete().eq('job_id', jobId)
    await supabase.from('jobs').delete().eq('id', jobId)
    const reason = updateError
      ? safeError(updateError.message)
      : 'This request was already reviewed by someone else.'
    return { success: false, message: `Nothing was accepted: ${reason}` }
  }

  return {
    success: true,
    message: `Job ${orderCode} created successfully!`,
    receipt: {
      orderCode,
      price,
      amountReceived,
      change: amountReceived - price,
    },
  }
}

export async function rejectJobRequest(
  _prevState: AcceptState,
  formData: FormData
): Promise<AcceptState> {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  const supabase = createAdminClient()

  if (!user) {
    return { success: false, message: 'Not authenticated.' }
  }

  // Both staff and owner can reject requests
  const role = getRoleFromEmail(user.email)
  if (role !== 'staff' && role !== 'owner') {
    return { success: false, message: 'Not authorized.' }
  }

  const requestId = String(formData.get('requestId') ?? '')
  if (!requestId) {
    return { success: false, message: 'Request not found.' }
  }

  const { error } = await supabase
    .from('job_requests')
    .update({
      status: 'REJECTED',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('status', 'PENDING')

  if (error) {
    return { success: false, message: safeError(error.message) }
  }

  revalidatePath('/staff')
  return { success: true, message: 'Request rejected.' }
}

export async function updateJobStatus(jobId: string, status: string) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  const supabase = createAdminClient()

  if (!user) {
    return { success: false, message: 'Not authenticated.' }
  }

  // C1 fix: both staff and owner can move jobs, but must be authenticated @printara.com
  const role = getRoleFromEmail(user.email)
  if (role !== 'staff' && role !== 'owner') {
    return { success: false, message: 'Not authorized.' }
  }

  // C2 fix: reject any status not on the allowlist
  if (!ALLOWED_STATUSES.has(status)) {
    return { success: false, message: 'Invalid status.' }
  }

  const updates = status === 'COMPLETED'
    ? { status, completed_at: new Date().toISOString(), is_archived: false }
    : { status, completed_at: null, is_archived: false }

  const { error } = await supabase.from('jobs').update(updates).eq('id', jobId)

  if (error) {
    return { success: false, message: safeError(error.message) }
  }

  revalidatePath('/staff')
  return { success: true, message: 'Updated.' }
}

