'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { upsertBudget } from '@/app/actions/budget'
import { formatIDR } from '@/lib/format'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  color: string | null
  group: 'needs' | 'wants' | 'obligations'
}

interface Income {
  id: string
  source: string
  amount: number
  note: string | null
}

interface SavingGoal {
  id: string
  name: string
  target_amount: number | null
  target_date: string | null
}

interface Installment {
  id: string
  name: string
  monthly_amount: number
}

interface Props {
  activeMonth: string
  categories: Category[]
  budgetMap: Record<string, number>
  expenseRealisasiMap: Record<string, number>
  incomes: Income[]
  savingGoals: SavingGoal[]
  savingRealisasiMap: Record<string, number>
  installments: Installment[]
  installmentRealisasiMap: Record<string, number>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function prevMonth(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

// ─── Editable Estimasi Cell ───────────────────────────────────────────────────

function EstimasiCell({
  categoryId,
  month,
  initialValue,
}: {
  categoryId: string
  month: string
  initialValue: number
}) {
  const [value, setValue] = useState(initialValue)
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleSave = () => {
    setEditing(false)
    startTransition(async () => {
      await upsertBudget(categoryId, month, value)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full text-right px-2 py-1 border border-ring rounded text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        autoFocus
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={cn(
        'cursor-pointer hover:underline block text-right px-2 py-1 rounded transition-colors',
        'hover:bg-muted/50',
        pending && 'opacity-50'
      )}
      title="Klik untuk edit"
    >
      {pending ? <Loader2 className="w-3 h-3 animate-spin inline" /> : formatIDR(value)}
    </span>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ estimasi, realisasi }: { estimasi: number; realisasi: number }) {
  if (estimasi <= 0) {
    return realisasi > 0 ? (
      <div className="w-full bg-muted rounded-full h-1.5">
        <div className="bg-red-500 h-1.5 rounded-full w-full" />
      </div>
    ) : null
  }
  const pct = Math.min((realisasi / estimasi) * 100, 100)
  const over = realisasi > estimasi
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className={cn('h-1.5 rounded-full transition-all', over ? 'bg-red-500' : 'bg-emerald-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn('text-xs tabular-nums', over ? 'text-red-500' : 'text-muted-foreground')}>
        {Math.round(pct)}%
      </span>
    </div>
  )
}

// ─── Section Header Row ───────────────────────────────────────────────────────

function SectionHeader({
  label,
  color = 'bg-slate-700',
}: {
  label: string
  color?: string
}) {
  return (
    <tr className={cn(color, 'text-white')}>
      <td colSpan={6} className="px-4 py-2 font-bold text-xs uppercase tracking-wider">
        {label}
      </td>
    </tr>
  )
}

// ─── Total Row ────────────────────────────────────────────────────────────────

function TotalRow({
  label,
  estimasi,
  realisasi,
  showProgress = false,
}: {
  label: string
  estimasi: number
  realisasi?: number
  showProgress?: boolean
}) {
  const hasRealisasi = realisasi !== undefined
  return (
    <tr className="bg-muted/60 font-semibold border-t-2 border-border text-sm">
      <td />
      <td className="px-4 py-2.5 text-foreground">{label}</td>
      <td className="text-right px-4 py-2.5 tabular-nums">{formatIDR(estimasi)}</td>
      <td className={cn('text-right px-4 py-2.5 tabular-nums', hasRealisasi && realisasi! > estimasi ? 'text-red-600' : 'text-foreground')}>
        {hasRealisasi ? formatIDR(realisasi!) : ''}
      </td>
      <td className="px-4 py-2.5">
        {showProgress && hasRealisasi && (
          <ProgressBar estimasi={estimasi} realisasi={realisasi!} />
        )}
      </td>
      <td />
    </tr>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BudgetClient({
  activeMonth,
  categories,
  budgetMap,
  expenseRealisasiMap,
  incomes,
  savingGoals,
  savingRealisasiMap,
  installments,
  installmentRealisasiMap,
}: Props) {
  const { t } = useLang()
  const router = useRouter()

  // ─── Group categories ───────────────────────────────────────────────────
  const needsCategories = categories.filter((c) => c.group === 'needs')
  const wantsCategories = categories.filter((c) => c.group === 'wants')
  const obligationCategories = categories.filter((c) => c.group === 'obligations')

  // ─── Income totals ──────────────────────────────────────────────────────
  const totalIncomeRealisasi = incomes.reduce((s, i) => s + Number(i.amount), 0)
  // Income estimasi = sum of incomes (same as realisasi — income entries are actuals)
  const totalIncomeEstimasi = totalIncomeRealisasi

  // ─── Expense totals per group ───────────────────────────────────────────
  function groupTotals(cats: Category[]) {
    const estimasi = cats.reduce((s, c) => s + (budgetMap[c.id] ?? 0), 0)
    const realisasi = cats.reduce((s, c) => s + (expenseRealisasiMap[c.id] ?? 0), 0)
    return { estimasi, realisasi }
  }
  const needsTotals = groupTotals(needsCategories)
  const wantsTotals = groupTotals(wantsCategories)
  // Obligations = obligation categories + installments
  const obCatEstimasi = obligationCategories.reduce((s, c) => s + (budgetMap[c.id] ?? 0), 0)
  const obCatRealisasi = obligationCategories.reduce(
    (s, c) => s + (expenseRealisasiMap[c.id] ?? 0),
    0
  )
  const installmentEstimasi = installments.reduce((s, i) => s + Number(i.monthly_amount), 0)
  const installmentRealisasi = installments.reduce(
    (s, i) => s + (installmentRealisasiMap[i.id] ?? 0),
    0
  )
  const obligationsTotals = {
    estimasi: obCatEstimasi + installmentEstimasi,
    realisasi: obCatRealisasi + installmentRealisasi,
  }

  // ─── Savings totals ─────────────────────────────────────────────────────
  const totalSavingRealisasi = savingGoals.reduce(
    (s, g) => s + Math.max(0, savingRealisasiMap[g.id] ?? 0),
    0
  )
  // Estimasi for savings: no budget concept — show sum of goal realisasi as estimasi too
  const totalSavingEstimasi = totalSavingRealisasi

  // ─── Summary ────────────────────────────────────────────────────────────
  const totalExpenseEstimasi =
    needsTotals.estimasi + wantsTotals.estimasi + obligationsTotals.estimasi
  const totalExpenseRealisasi =
    needsTotals.realisasi + wantsTotals.realisasi + obligationsTotals.realisasi

  const sisaSaldo = totalIncomeRealisasi - totalExpenseRealisasi - totalSavingRealisasi

  // ─── Month navigation ───────────────────────────────────────────────────
  const handleMonthChange = (newMonth: string) => {
    router.push(`/budget?month=${newMonth}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t.budgetPlan}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {formatMonthLabel(activeMonth)}
          </p>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
          <button
            onClick={() => handleMonthChange(prevMonth(activeMonth))}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium min-w-[120px] text-center tabular-nums">
            {formatMonthLabel(activeMonth)}
          </span>
          <button
            onClick={() => handleMonthChange(nextMonth(activeMonth))}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-auto bg-card shadow-sm">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left py-3 px-4 font-semibold w-10 text-muted-foreground" />
              <th className="text-left py-3 px-4 font-semibold w-52">{t.item}</th>
              <th className="text-right py-3 px-4 font-semibold w-36">{t.budgetEst}</th>
              <th className="text-right py-3 px-4 font-semibold w-36">{t.actual}</th>
              <th className="text-left py-3 px-4 font-semibold w-36">{t.progress}</th>
              <th className="text-left py-3 px-4 font-semibold">{t.notes}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">

            {/* ── INCOME ─────────────────────────────────────────────────── */}
            <SectionHeader label={t.incomeSection} color="bg-blue-700" />

            {incomes.length === 0 ? (
              <tr>
                <td />
                <td colSpan={5} className="px-4 py-3 text-muted-foreground italic text-xs">
                  Belum ada pemasukan bulan ini. Tambah di halaman Pemasukan.
                </td>
              </tr>
            ) : (
              incomes.map((inc) => (
                <tr key={inc.id} className="hover:bg-muted/20 transition-colors">
                  <td />
                  <td className="px-4 py-2.5 text-foreground">{inc.source}</td>
                  <td className="text-right px-4 py-2.5 tabular-nums text-muted-foreground">
                    {formatIDR(Number(inc.amount))}
                  </td>
                  <td className="text-right px-4 py-2.5 tabular-nums text-emerald-600 font-medium">
                    {formatIDR(Number(inc.amount))}
                  </td>
                  <td />
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{inc.note ?? ''}</td>
                </tr>
              ))
            )}

            <TotalRow
              label={t.totalIncome}
              estimasi={totalIncomeEstimasi}
              realisasi={totalIncomeRealisasi}
            />

            {/* ── NEEDS ──────────────────────────────────────────────────── */}
            <SectionHeader label={t.needsSection} color="bg-orange-600" />

            {needsCategories.map((cat) => {
              const est = budgetMap[cat.id] ?? 0
              const real = expenseRealisasiMap[cat.id] ?? 0
              return (
                <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5">
                    {cat.color && (
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-foreground">{cat.name}</td>
                  <td className="px-1 py-1.5">
                    <EstimasiCell categoryId={cat.id} month={activeMonth} initialValue={est} />
                  </td>
                  <td
                    className={cn(
                      'text-right px-4 py-2.5 tabular-nums font-medium',
                      real > est && est > 0 ? 'text-red-600' : real > 0 ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {formatIDR(real)}
                  </td>
                  <td className="px-4 py-2.5">
                    <ProgressBar estimasi={est} realisasi={real} />
                  </td>
                  <td />
                </tr>
              )
            })}

            <TotalRow
              label={`Total ${t.needsSection.split(' - ')[1] ?? t.needsSection}`}
              estimasi={needsTotals.estimasi}
              realisasi={needsTotals.realisasi}
              showProgress
            />

            {/* ── OBLIGATIONS ────────────────────────────────────────────── */}
            <SectionHeader label={t.obligationsSection} color="bg-rose-700" />

            {/* Obligation categories */}
            {obligationCategories.map((cat) => {
              const est = budgetMap[cat.id] ?? 0
              const real = expenseRealisasiMap[cat.id] ?? 0
              return (
                <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5">
                    {cat.color && (
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-foreground">{cat.name}</td>
                  <td className="px-1 py-1.5">
                    <EstimasiCell categoryId={cat.id} month={activeMonth} initialValue={est} />
                  </td>
                  <td
                    className={cn(
                      'text-right px-4 py-2.5 tabular-nums font-medium',
                      real > est && est > 0 ? 'text-red-600' : real > 0 ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {formatIDR(real)}
                  </td>
                  <td className="px-4 py-2.5">
                    <ProgressBar estimasi={est} realisasi={real} />
                  </td>
                  <td />
                </tr>
              )
            })}

            {/* Active installments */}
            {installments.map((inst) => {
              const est = Number(inst.monthly_amount)
              const real = installmentRealisasiMap[inst.id] ?? 0
              return (
                <tr key={`inst-${inst.id}`} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-rose-400" />
                  </td>
                  <td className="px-4 py-2.5 text-foreground">
                    {inst.name}
                    <span className="ml-1.5 text-xs text-muted-foreground">(cicilan)</span>
                  </td>
                  <td className="text-right px-4 py-2.5 tabular-nums text-muted-foreground">
                    {formatIDR(est)}
                  </td>
                  <td
                    className={cn(
                      'text-right px-4 py-2.5 tabular-nums font-medium',
                      real >= est ? 'text-emerald-600' : real > 0 ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {formatIDR(real)}
                  </td>
                  <td className="px-4 py-2.5">
                    <ProgressBar estimasi={est} realisasi={real} />
                  </td>
                  <td />
                </tr>
              )
            })}

            <TotalRow
              label={`Total Kewajiban & Cicilan`}
              estimasi={obligationsTotals.estimasi}
              realisasi={obligationsTotals.realisasi}
              showProgress
            />

            {/* ── WANTS ──────────────────────────────────────────────────── */}
            <SectionHeader label={t.wantsSection} color="bg-purple-700" />

            {wantsCategories.map((cat) => {
              const est = budgetMap[cat.id] ?? 0
              const real = expenseRealisasiMap[cat.id] ?? 0
              return (
                <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5">
                    {cat.color && (
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-foreground">{cat.name}</td>
                  <td className="px-1 py-1.5">
                    <EstimasiCell categoryId={cat.id} month={activeMonth} initialValue={est} />
                  </td>
                  <td
                    className={cn(
                      'text-right px-4 py-2.5 tabular-nums font-medium',
                      real > est && est > 0 ? 'text-red-600' : real > 0 ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {formatIDR(real)}
                  </td>
                  <td className="px-4 py-2.5">
                    <ProgressBar estimasi={est} realisasi={real} />
                  </td>
                  <td />
                </tr>
              )
            })}

            <TotalRow
              label={`Total Gaya Hidup & Sosial`}
              estimasi={wantsTotals.estimasi}
              realisasi={wantsTotals.realisasi}
              showProgress
            />

            {/* ── SAVINGS ────────────────────────────────────────────────── */}
            <SectionHeader label={t.savingsSection} color="bg-teal-700" />

            {savingGoals.length === 0 ? (
              <tr>
                <td />
                <td colSpan={5} className="px-4 py-3 text-muted-foreground italic text-xs">
                  Belum ada tujuan tabungan aktif.
                </td>
              </tr>
            ) : (
              savingGoals.map((goal) => {
                const real = Math.max(0, savingRealisasiMap[goal.id] ?? 0)
                return (
                  <tr key={goal.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-teal-500" />
                    </td>
                    <td className="px-4 py-2.5 text-foreground">{goal.name}</td>
                    <td className="text-right px-4 py-2.5 tabular-nums text-muted-foreground">
                      {formatIDR(real)}
                    </td>
                    <td className="text-right px-4 py-2.5 tabular-nums font-medium text-teal-600">
                      {formatIDR(real)}
                    </td>
                    <td />
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {goal.target_amount ? `Target: ${formatIDR(Number(goal.target_amount))}` : ''}
                    </td>
                  </tr>
                )
              })
            )}

            <TotalRow
              label={t.totalSavings}
              estimasi={totalSavingEstimasi}
              realisasi={totalSavingRealisasi}
            />

            {/* ── SUMMARY ────────────────────────────────────────────────── */}
            <SectionHeader label={t.summary} color="bg-slate-800" />

            <tr className="hover:bg-muted/20">
              <td />
              <td className="px-4 py-2.5 font-medium">{t.totalIncome}</td>
              <td className="text-right px-4 py-2.5 tabular-nums">{formatIDR(totalIncomeEstimasi)}</td>
              <td className="text-right px-4 py-2.5 tabular-nums text-emerald-600 font-medium">
                {formatIDR(totalIncomeRealisasi)}
              </td>
              <td />
              <td />
            </tr>

            <tr className="hover:bg-muted/20">
              <td />
              <td className="px-4 py-2.5 font-medium">{t.totalExpenses}</td>
              <td className="text-right px-4 py-2.5 tabular-nums">{formatIDR(totalExpenseEstimasi)}</td>
              <td className="text-right px-4 py-2.5 tabular-nums text-red-600 font-medium">
                {formatIDR(totalExpenseRealisasi)}
              </td>
              <td className="px-4 py-2.5">
                <ProgressBar estimasi={totalIncomeRealisasi} realisasi={totalExpenseRealisasi} />
              </td>
              <td />
            </tr>

            <tr className="hover:bg-muted/20">
              <td />
              <td className="px-4 py-2.5 font-medium">{t.totalSavings}</td>
              <td className="text-right px-4 py-2.5 tabular-nums">{formatIDR(totalSavingEstimasi)}</td>
              <td className="text-right px-4 py-2.5 tabular-nums text-teal-600 font-medium">
                {formatIDR(totalSavingRealisasi)}
              </td>
              <td />
              <td />
            </tr>

            {/* Sisa Saldo */}
            <tr className="border-t-2 border-border bg-muted/40 font-bold">
              <td />
              <td className="px-4 py-3 text-base">{t.remainingBalance}</td>
              <td />
              <td
                className={cn(
                  'text-right px-4 py-3 tabular-nums text-base',
                  sisaSaldo >= 0 ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {formatIDR(sisaSaldo)}
              </td>
              <td />
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {sisaSaldo >= 0 ? 'Surplus' : 'Defisit'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <p className="text-xs text-muted-foreground">
        Klik pada kolom <strong>{t.budgetEst}</strong> untuk mengedit anggaran kategori.
        Data {t.actual} dihitung otomatis dari transaksi yang sudah terjadi.
      </p>
    </div>
  )
}
