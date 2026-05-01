import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ArrowUpRight, Check, PiggyBank, RefreshCw, TrendingDown, TrendingUp, Wallet } from 'lucide-react'

const features = [
  {
    icon: TrendingUp,
    label: 'Pemasukan',
    desc: 'Catat semua sumber pemasukan tanpa ribet.',
  },
  {
    icon: TrendingDown,
    label: 'Pengeluaran',
    desc: 'Lihat ke mana uang keluar dengan kategori yang jelas.',
  },
  {
    icon: PiggyBank,
    label: 'Tabungan',
    desc: 'Pisahkan target dan progres tabungan di satu dashboard.',
  },
  {
    icon: RefreshCw,
    label: 'Cicilan',
    desc: 'Pantau tagihan rutin supaya tidak ada yang terlewat.',
  },
]

const highlights = [
  'Ringkas dan mudah dipakai setiap hari',
  'Semua catatan keuangan ada di satu tempat',
  'Cocok untuk budgeting pribadi tanpa spreadsheet',
]

const stats = [
  { value: '4', label: 'menu inti' },
  { value: '1', label: 'dashboard terpusat' },
  { value: '0', label: 'iklan dan biaya personal' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <header className="border-b border-slate-200/80 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Wallet className="h-4 w-4 text-slate-700" />
            </span>
            <span>Financial Planning</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: 'ghost', className: 'text-slate-700' })}>
              Masuk
            </Link>
            <Link
              href="/register"
              className={buttonVariants({
                className: 'rounded-full bg-slate-900 text-white hover:bg-slate-800',
              })}
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="px-5 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 shadow-sm">
                Simple personal finance tracker
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Kelola uangmu dengan cara yang lebih tenang.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Catat pemasukan, pengeluaran, tabungan, dan cicilan dalam tampilan yang
                bersih. Fokus ke hal penting tanpa dashboard yang ramai.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className={buttonVariants({
                    size: 'lg',
                    className: 'rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800',
                  })}
                >
                  Mulai Gratis
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'lg',
                    className: 'rounded-full border-slate-300 bg-white px-6 text-slate-700 hover:bg-slate-100',
                  })}
                >
                  Lihat Akun
                </Link>
              </div>

              <div className="mt-8 space-y-3">
                {highlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-900 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Ringkasan Bulan Ini</p>
                    <p className="mt-2 text-3xl font-semibold">Rp4.250.000</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                    Stabil
                  </span>
                </div>

                <div className="mt-8 grid gap-3">
                  <div className="rounded-2xl bg-white/6 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Pemasukan</span>
                      <span className="flex items-center gap-1 text-emerald-300">
                        <TrendingUp className="h-4 w-4" />
                        Rp7.500.000
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/6 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Pengeluaran</span>
                      <span className="flex items-center gap-1 text-rose-300">
                        <TrendingDown className="h-4 w-4" />
                        Rp2.100.000
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/6 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Tabungan</span>
                      <span className="flex items-center gap-1 text-sky-300">
                        <PiggyBank className="h-4 w-4" />
                        Rp1.150.000
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white px-5 py-16 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
                Fitur Utama
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Semua yang dibutuhkan untuk finansial pribadi.
              </h2>
              <p className="mt-3 text-slate-600">
                Cukup empat area utama, tanpa elemen yang berlebihan.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon

                return (
                  <div
                    key={feature.label}
                    className="rounded-[1.75rem] border border-slate-200 bg-stone-50 p-6 transition-colors hover:bg-white"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                      <Icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-900">{feature.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6">
          <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Mulai dari catatan yang sederhana.
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Daftar gratis dan pakai dashboard yang lebih bersih untuk kebutuhan harian.
              </p>
            </div>

            <Link
              href="/register"
              className={buttonVariants({
                size: 'lg',
                className: 'rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800',
              })}
            >
              Buat Akun
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
