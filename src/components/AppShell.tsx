'use client'

import { Sidebar } from '@/components/layout/Sidebar'

// AppShell is loaded with ssr:false from layout.tsx,
// so this and all its children only run on the client — never on the server.
// This prevents Supabase browser client errors during build-time prerendering.
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
