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
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-stone-50">
          <Wallet className="h-4 w-4 text-slate-700" />
        </span>
        <div>
          <p className="text-base font-semibold tracking-tight text-slate-900">Financial</p>
          <p className="text-xs text-slate-500">Planning</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-stone-50 hover:text-slate-900'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {t[item.labelKey]}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-200 px-4 pb-6 pt-4">
        <button
          onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-500 transition-colors hover:bg-stone-50 hover:text-slate-900"
        >
          <Languages className="w-5 h-5 flex-shrink-0" />
          {lang === 'en' ? 'Bahasa Indonesia' : 'English'}
        </button>
        <Link
          href="/settings/categories"
          onClick={onClose}
          className={cn(
            'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:bg-stone-50 hover:text-slate-900'
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {t.settings}
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <NavContent pathname={pathname} />
      </aside>

      <button
        className="fixed left-3 top-3 z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-sm lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Buka menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white shadow-2xl lg:hidden">
            <button
              className="absolute right-4 top-4 rounded-xl p-1.5 transition-colors hover:bg-stone-50"
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
