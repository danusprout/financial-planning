'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { upsertBudget, upsertBudgetBank } from '@/app/actions/budget'
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

interface Bank {
  id: string
  name: string
  type: string
  color: string | null
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
  bank_id: string | null
}

interface Props {
  activeMonth: string
  categories: Category[]
  banks: Bank[]
  budgetMap: Record<string, number>
  budgetBankMap: Record<string, string | null>
  expenseRealisasiMap: Record<string, number>
  incomes: Income[]
  savingGoals: SavingGoal[]
  savingRealisasiMap: Record<string, number>
  installments: Installment[]
  installmentRealisasiMap: Record<string, number>
}

const UNASSIGNED_BANK = '__none__'

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

function BankSourceCell({
  categoryId,
  month,
  initialBankId,
  banks,
}: {
  categoryId: string
  month: string
  initialBankId: string | null
  banks: Bank[]
}) {
  const [value, setValue] = useState(initialBankId ?? UNASSIGNED_BANK)
  const [pending, startTransition] = useTransition()

  return (
    <div className="relative">
      <select
        value={value === UNASSIGNED_BANK ? '' : value}
        onChange={(event) => {
          const nextValue = event.target.value || UNASSIGNED_BANK
          setValue(nextValue)
          startTransition(async () => {
            await upsertBudgetBank(categoryId, month, nextValue === UNASSIGNED_BANK ? null : nextValue)
          })
        }}
        className={cn(
          'h-9 w-full appearance-none rounded-xl border border-slate-200 bg-stone-50 px-3 pr-8 text-sm text-slate-900 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30',
          pending && 'opacity-60'
        )}
      >
        <option value="">{'— Tidak ada —'}</option>
        {banks.map((bank) => (
          <option key={bank.id} value={bank.id}>
            {bank.name}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-slate-400" />}
    </div>
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
      <td colSpan={7} className="px-4 py-2 font-bold text-xs uppercase tracking-wider">
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
      <td />
    </tr>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BudgetClient({
  activeMonth,
  categories,
  banks,
  budgetMap,
  budgetBankMap,
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

  const budgetByBankMap: Record<string, { name: string; color: string | null; total: number }> = {}
  for (const cat of categories) {
    const amount = budgetMap[cat.id] ?? 0
    const bankId = budgetBankMap[cat.id]
    if (!bankId || amount <= 0) continue
    const bank = banks.find((item) => item.id === bankId)
    if (!bank) continue
    if (!budgetByBankMap[bank.id]) {
      budgetByBankMap[bank.id] = { name: bank.name, color: bank.color, total: 0 }
    }
    budgetByBankMap[bank.id].total += amount
  }

  for (const inst of installments) {
    if (!inst.bank_id) continue
    const bank = banks.find((item) => item.id === inst.bank_id)
    if (!bank) continue
    if (!budgetByBankMap[bank.id]) {
      budgetByBankMap[bank.id] = { name: bank.name, color: bank.color, total: 0 }
    }
    budgetByBankMap[bank.id].total += Number(inst.monthly_amount)
  }

  const bankAllocations = Object.values(budgetByBankMap).sort((a, b) => b.total - a.total)

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
              <th className="text-left py-3 px-4 font-semibold w-52">{t.paymentSource}</th>
              <th className="text-left py-3 px-4 font-semibold">{t.notes}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">

            {/* ── INCOME ─────────────────────────────────────────────────── */}
            <SectionHeader label={t.incomeSection} color="bg-blue-700" />

            {incomes.length === 0 ? (
              <tr>
                <td />
                <td colSpan={6} className="px-4 py-3 text-muted-foreground italic text-xs">
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
                  <td className="px-4 py-2.5">
                    <BankSourceCell
                      categoryId={cat.id}
                      month={activeMonth}
                      initialBankId={budgetBankMap[cat.id] ?? null}
                      banks={banks}
                    />
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
                  <td className="px-4 py-2.5">
                    <BankSourceCell
                      categoryId={cat.id}
                      month={activeMonth}
                      initialBankId={budgetBankMap[cat.id] ?? null}
                      banks={banks}
                    />
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
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">
                    {banks.find((bank) => bank.id === inst.bank_id)?.name ?? '—'}
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
                  <td className="px-4 py-2.5">
                    <BankSourceCell
                      categoryId={cat.id}
                      month={activeMonth}
                      initialBankId={budgetBankMap[cat.id] ?? null}
                      banks={banks}
                    />
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
                <td colSpan={6} className="px-4 py-3 text-muted-foreground italic text-xs">
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

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Alokasi Budget per Sumber Dana</h2>
        {bankAllocations.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Belum ada sumber dana yang dipilih di rincian anggaran bulan ini.
          </p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {bankAllocations.map((bank) => (
              <div
                key={bank.name}
                className="rounded-lg border border-border bg-muted/30 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: bank.color ?? '#64748b' }}
                  />
                  <span className="text-sm font-medium text-foreground">{bank.name}</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatIDR(bank.total)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
