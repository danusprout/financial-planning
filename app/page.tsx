import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <span className="font-bold text-lg">💰 Financial Planning</span>
        <div className="flex gap-2">
          <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>Masuk</Link>
          <Link href="/register" className={buttonVariants({ size: 'sm' })}>Daftar</Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-4xl font-bold tracking-tight max-w-lg">
          Catat keuangan pribadimu dengan mudah
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md">
          Gantikan Google Sheets-mu dengan app yang lebih terstruktur. Lacak pemasukan,
          pengeluaran, tabungan, dan cicilan — semuanya dalam satu tempat.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/register" className={buttonVariants({ size: 'lg' })}>Mulai Gratis</Link>
          <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>Sudah punya akun?</Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4 max-w-2xl w-full text-left">
          {[
            { icon: '📥', label: 'Pemasukan', desc: 'Catat gaji, bonus, dan sumber lainnya' },
            { icon: '💸', label: 'Pengeluaran', desc: 'Log harian per kategori & sumber dana' },
            { icon: '🏦', label: 'Tabungan', desc: 'Multi-goal: Dana Darurat, Investasi, dll' },
            { icon: '🔄', label: 'Cicilan', desc: 'Jadwal otomatis + pembayaran manual' },
          ].map((f) => (
            <div key={f.label} className="rounded-xl border p-4 space-y-1">
              <div className="text-2xl">{f.icon}</div>
              <div className="font-semibold text-sm">{f.label}</div>
              <div className="text-xs text-muted-foreground">{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground border-t">
        Data kamu aman — hanya kamu yang bisa mengaksesnya.
      </footer>
    </div>
  )
}
