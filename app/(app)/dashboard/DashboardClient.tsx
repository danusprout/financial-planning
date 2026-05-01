'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatIDR, formatMonth, formatDate } from '@/lib/format'
import { useLang } from '@/lib/i18n'
import { ChevronLeft, ChevronRight, AlertCircle, ChartPie, ChartColumn } from 'lucide-react'

interface Props {
  activeMonth: string
  totalIncome: number
  totalExpense: number
  netSaving: number
  sisaSaldo: number
  pieData: { name: string; color: string | null; total: number }[]
  barData: { name: string; estimasi: number; realisasi: number }[]
  upcomingInstallments: { id: string; name: string; due_date: string; expected_amount: number }[]
}

function prevMonth(yyyyMM: string) {
  const [y, m] = yyyyMM.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(yyyyMM: string) {
  const [y, m] = yyyyMM.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const FALLBACK_COLORS = [
  '#0f172a', '#475569', '#0f766e', '#1d4ed8', '#7c3aed',
  '#be123c', '#ca8a04', '#0f766e', '#7c2d12', '#334155',
]

export function DashboardClient({
  activeMonth,
  totalIncome,
  totalExpense,
  netSaving,
  sisaSaldo,
  pieData,
  barData,
  upcomingInstallments,
}: Props) {
  const router = useRouter()
  const { t } = useLang()
  const navigate = (m: string) => router.push(`/dashboard?month=${m}`)

  const summaryCards = [
    { label: t.totalIncome, value: totalIncome, tone: 'text-emerald-600' },
    { label: t.totalExpenses, value: totalExpense, tone: 'text-rose-600' },
    { label: t.netSavingsLabel, value: netSaving, tone: netSaving >= 0 ? 'text-sky-600' : 'text-amber-600' },
    { label: t.remainingBalanceLabel, value: sisaSaldo, tone: sisaSaldo >= 0 ? 'text-slate-900' : 'text-rose-600' },
  ]

  const hasPieData = pieData.length > 0
  const hasBarData = barData.length > 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
            Monthly Overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {t.dashboardTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{t.dashboardSubtitle}</p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-stone-50 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-slate-300 bg-white hover:bg-slate-100"
              onClick={() => navigate(prevMonth(activeMonth))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-32 text-center">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Periode aktif</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                {formatMonth(new Date(`${activeMonth}-01`))}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-slate-300 bg-white hover:bg-slate-100"
              onClick={() => navigate(nextMonth(activeMonth))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-[1.5rem] border border-slate-200 bg-stone-50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{card.label}</p>
            <p className={`mt-2 text-2xl font-semibold tracking-tight ${card.tone}`}>
              {formatIDR(card.value)}
            </p>
          </div>
        ))}
      </div>

      {upcomingInstallments.length > 0 && (
        <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 px-5 py-5">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-700">{t.upcomingDue}</p>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingInstallments.map((inst) => (
              <div key={inst.id} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{inst.name}</p>
                  <p className="text-xs text-slate-500">{formatDate(inst.due_date)}</p>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {formatIDR(inst.expected_amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <ChartPie className="h-4 w-4 text-slate-500" />
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {t.expenseBreakdown}
            </h2>
          </div>

          {hasPieData ? (
            <>
              <div className="mt-5 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={100}
                      paddingAngle={3}
                      label={({ percent }: { percent?: number }) =>
                        (percent ?? 0) > 0.06 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ''
                      }
                      labelLine={false}
                    >
                      {pieData.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatIDR(v as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {pieData.map((entry, i) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-stone-50 px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: entry.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
                      />
                      <span className="truncate text-sm text-slate-600">{entry.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatIDR(entry.total)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-200 bg-stone-50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-900">Pie chart akan muncul saat ada pengeluaran paid.</p>
              <p className="mt-2 text-sm text-slate-500">
                Sekarang total pengeluaran bulan ini masih {formatIDR(totalExpense)}.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <ChartColumn className="h-4 w-4 text-slate-500" />
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {t.budgetVsActual}
            </h2>
          </div>

          {hasBarData ? (
            <>
              <div className="mt-5 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ left: -10, top: 12, right: 8 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={(v) => `${((v as number) / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(v) => formatIDR(v as number)} />
                    <Legend />
                    <Bar dataKey="estimasi" fill="#cbd5e1" name="Estimasi" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="realisasi" fill="#0f172a" name="Realisasi" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 text-left text-xs font-semibold text-slate-400">{t.category}</th>
                      <th className="py-2 text-right text-xs font-semibold text-slate-400">{t.budgetEst}</th>
                      <th className="py-2 text-right text-xs font-semibold text-slate-400">{t.actual}</th>
                      <th className="py-2 text-right text-xs font-semibold text-slate-400">{t.differenceLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barData.map((row) => {
                      const diff = row.estimasi - row.realisasi
                      return (
                        <tr key={row.name} className="border-b border-slate-100 last:border-0">
                          <td className="py-3 text-slate-700">{row.name}</td>
                          <td className="py-3 text-right text-slate-700">{formatIDR(row.estimasi)}</td>
                          <td className="py-3 text-right text-slate-700">{formatIDR(row.realisasi)}</td>
                          <td className={`py-3 text-right font-medium ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {diff >= 0 ? '+' : ''}{formatIDR(diff)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-200 bg-stone-50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-900">Belum ada data estimasi vs realisasi.</p>
              <p className="mt-2 text-sm text-slate-500">
                Tambahkan budget bulanan supaya chart per kategori bisa tampil.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
