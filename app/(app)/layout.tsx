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
      <div className="min-h-screen bg-stone-50">
        <Sidebar />

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-stone-50/90 backdrop-blur">
            <div className="flex h-14 items-center px-4 lg:px-8">
              <span className="pl-12 text-sm font-semibold tracking-tight text-slate-900 lg:pl-0 lg:hidden">
                Financial Planning
              </span>
              <span className="hidden items-center gap-2 text-sm font-medium text-slate-500 lg:flex">
                <Wallet className="h-4 w-4 text-slate-500" />
                Personal finance workspace
              </span>
            </div>
          </header>

          <main className="mx-auto max-w-6xl p-4 lg:p-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </LangProvider>
  )
}
