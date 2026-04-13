'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase'

// Hook that creates the Supabase client once per component mount
// Using a hook ensures it only runs on the client, never during server prerendering
export function useSupabase() {
  return useMemo(() => createClient(), [])
}
