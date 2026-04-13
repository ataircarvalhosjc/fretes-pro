import { createClient } from '@supabase/supabase-js'

// Admin client — use ONLY in API Routes (server-side)
// Uses service role key to bypass RLS
// Never import this in client components
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
