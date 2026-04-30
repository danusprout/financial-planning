'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'

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
  '#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899',
  '#06b6d4', '#f59e0b', '#6366f1', '#14b8a6', '#a855f7',
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
  const navigate = (m: string) => router.push(`/dashboard?month=${m}`)

  return (
    <div className="space-y-6">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(prevMonth(activeMonth))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-semibold">{formatMonth(new Date(`${activeMonth}-01`))}</span>
        <Button variant="ghost" size="icon" onClick={() => navigate(nextMonth(activeMonth))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Pemasukan', value: totalIncome, color: 'text-green-600' },
          { label: 'Pengeluaran', value: totalExpense, color: 'text-red-600' },
          { label: 'Tabungan (net)', value: netSaving, color: netSaving >= 0 ? 'text-blue-600' : 'text-orange-600' },
          { label: 'Sisa Saldo', value: sisaSaldo, color: sisaSaldo >= 0 ? 'text-foreground' : 'text-destructive' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${card.color}`}>
              {formatIDR(card.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Cicilan upcoming */}
      {upcomingInstallments.length > 0 && (
        <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/20 px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="font-semibold text-sm text-amber-700 dark:text-amber-400">
              Cicilan jatuh tempo 7 hari ke depan
            </p>
          </div>
          <div className="space-y-2">
            {upcomingInstallments.map((inst) => (
              <div key={inst.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{inst.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(inst.due_date)}</p>
                </div>
                <span className="font-semibold text-sm">{formatIDR(inst.expected_amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Breakdown Pengeluaran</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  (percent ?? 0) > 0.05 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ''
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
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar chart: estimasi vs realisasi */}
      {barData.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Estimasi vs Realisasi</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ left: -10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${((v as number) / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatIDR(v as number)} />
              <Legend />
              <Bar dataKey="estimasi" fill="#94a3b8" name="Estimasi" radius={[3, 3, 0, 0]} />
              <Bar dataKey="realisasi" fill="#f97316" name="Realisasi" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {/* Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold text-muted-foreground text-xs">Kategori</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground text-xs">Estimasi</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground text-xs">Realisasi</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground text-xs">Selisih</th>
                </tr>
              </thead>
              <tbody>
                {barData.map((row) => {
                  const diff = row.estimasi - row.realisasi
                  return (
                    <tr key={row.name} className="border-b last:border-0">
                      <td className="py-2">{row.name}</td>
                      <td className="py-2 text-right">{formatIDR(row.estimasi)}</td>
                      <td className="py-2 text-right">{formatIDR(row.realisasi)}</td>
                      <td className={`py-2 text-right font-medium ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {diff >= 0 ? '+' : ''}{formatIDR(diff)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
