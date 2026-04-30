import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/shared/BottomNav'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { Settings, LogOut } from 'lucide-react'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      {/* Top header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 h-12 max-w-lg mx-auto">
          <span className="font-bold text-sm">💰 Financial</span>
          <div className="flex items-center gap-1">
            <Link href="/app/settings/categories" className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-8 w-8' })}>
              <Settings className="w-4 h-4" />
            </Link>
            <form action={logout}>
              <Button variant="ghost" size="icon" className="h-8 w-8" type="submit">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content — padded for bottom nav */}
      <main className="container mx-auto px-4 py-6 max-w-lg pb-24">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
