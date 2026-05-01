import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/Sidebar'
import { LangProvider } from '@/lib/i18n'
import { Wallet } from 'lucide-react'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <LangProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />

        <div className="lg:pl-64">
          {/* Mobile top header — spacer so content doesn't hide under hamburger */}
          <header className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur border-b flex items-center px-4 h-14">
            {/* 48px left padding to clear the hamburger button */}
            <span className="pl-12 flex items-center gap-2 font-bold text-sm text-foreground">
              <Wallet className="w-4 h-4 text-primary" /> Financial
            </span>
          </header>

          <main className="p-4 lg:p-8 max-w-6xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </LangProvider>
  )
}
