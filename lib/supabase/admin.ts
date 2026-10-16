import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// WARNING: this client bypasses RLS entirely. Never import this file
// into any Client Component or expose it to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}