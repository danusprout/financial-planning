import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { TrendingUp, TrendingDown, PiggyBank, RefreshCw, Shield, BarChart3, Wallet } from 'lucide-react'

const features = [
  {
    icon: TrendingUp,
    label: 'Pemasukan',
    desc: 'Catat gaji, bonus, dan semua sumber pemasukan secara rapi.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: TrendingDown,
    label: 'Pengeluaran',
    desc: 'Log pengeluaran harian per kategori dan sumber dana.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    icon: PiggyBank,
    label: 'Tabungan',
    desc: 'Kelola multi-goal: Dana Darurat, Investasi, Liburan, dan lainnya.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: RefreshCw,
    label: 'Cicilan',
    desc: 'Jadwal cicilan otomatis dengan pengingat dan pembayaran manual.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
]

const trustPoints = [
  { icon: Shield, label: 'Data Aman', desc: 'Data tersimpan aman — hanya kamu yang bisa mengaksesnya.' },
  { icon: BarChart3, label: 'Laporan Visual', desc: 'Ringkasan bulanan dan tren keuanganmu dalam satu tampilan.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-blue-600">
            <Wallet className="w-6 h-6" />
            <span>Financial Planning</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>Masuk</Link>
            <Link href="/register" className={buttonVariants()}>Daftar Gratis</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-8 border border-white/20">
            ✨ Gratis selamanya untuk penggunaan personal
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Kelola Keuangan Pribadi<br />dengan Cerdas
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Gantikan spreadsheet kamu dengan dashboard yang lebih terstruktur.
            Lacak pemasukan, pengeluaran, tabungan, dan cicilan dalam satu tempat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className={buttonVariants({
                size: 'lg',
                className: 'bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg',
              })}
            >
              Mulai Gratis Sekarang
            </Link>
            <Link
              href="/login"
              className={buttonVariants({
                variant: 'outline',
                size: 'lg',
                className: 'border-white/50 text-white hover:bg-white/10 bg-transparent',
              })}
            >
              Sudah punya akun? Masuk
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Semua yang kamu butuhkan</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Satu platform lengkap untuk semua aspek keuangan pribadimu.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.label}
                  className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
                >
                  <div className={`inline-flex p-3 rounded-xl ${f.bg}`}>
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{f.label}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trustPoints.map((t) => {
              const Icon = t.icon
              return (
                <div key={t.label} className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-blue-50">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t.label}</h3>
                    <p className="text-sm text-gray-500">{t.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16 px-6 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Siap mulai mengatur keuanganmu?</h2>
          <p className="text-blue-100 mb-8">Daftar gratis sekarang, tidak perlu kartu kredit.</p>
          <Link
            href="/register"
            className={buttonVariants({
              size: 'lg',
              className: 'bg-white text-blue-600 hover:bg-blue-50 font-semibold',
            })}
          >
            Buat Akun Gratis
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 text-center py-8 text-sm">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-medium text-white mb-1 flex items-center justify-center gap-2"><Wallet className="w-4 h-4" /> Financial Planning</p>
          <p>Data kamu aman — hanya kamu yang bisa mengaksesnya.</p>
        </div>
      </footer>
    </div>
  )
}
