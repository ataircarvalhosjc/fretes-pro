import { createBrowserClient } from '@supabase/ssr'

// Browser client — use in Client Components ('use client')
// Call createClient() and store the result at module level in each page file
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
