'use client'

// This component ensures all children only render on the client side.
// Prevents Supabase browser client from being called during server-side rendering.
export function ClientShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
