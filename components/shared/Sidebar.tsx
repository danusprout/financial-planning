'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  RefreshCw,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
  Wallet,
  Languages,
} from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import { useLang } from '@/lib/i18n'

const navItems = [
  { href: '/dashboard', labelKey: 'dashboard' as const, icon: LayoutDashboard },
  { href: '/budget', labelKey: 'budget' as const, icon: BookOpen },
  { href: '/income', labelKey: 'income' as const, icon: TrendingUp },
  { href: '/expenses', labelKey: 'expenses' as const, icon: TrendingDown },
  { href: '/savings', labelKey: 'savings' as const, icon: PiggyBank },
  { href: '/installments', labelKey: 'installments' as const, icon: RefreshCw },
]

function NavContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  const { lang, setLang, t } = useLang()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border/50">
        <Wallet className="w-6 h-6 text-primary" />
        <span className="font-bold text-lg text-foreground">Financial</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-lg',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {t[item.labelKey]}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-6 space-y-1 border-t border-border/50 pt-4">
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium w-full text-left transition-colors rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Languages className="w-5 h-5 flex-shrink-0" />
          {lang === 'en' ? 'Bahasa Indonesia' : 'English'}
        </button>
        <Link
          href="/settings/categories"
          onClick={onClose}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-lg',
            pathname.startsWith('/settings')
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {t.settings}
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium w-full text-left transition-colors rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {t.logout}
          </button>
        </form>
      </div>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar — fixed, always visible on lg+ */}
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-40">
        <NavContent pathname={pathname} />
      </aside>

      {/* Mobile: hamburger button (rendered inside mobile top header via portal-like approach) */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border shadow-sm"
        onClick={() => setMobileOpen(true)}
        aria-label="Buka menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
            >
              <X className="w-5 h-5" />
            </button>
            <NavContent pathname={pathname} onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  )
}
