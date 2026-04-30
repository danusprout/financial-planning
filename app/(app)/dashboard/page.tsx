import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'

interface Props {
  searchParams: Promise<{ month?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const { month } = await searchParams
  const now = new Date()
  const activeMonth = month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [y, m] = activeMonth.split('-').map(Number)
  const monthStart = `${activeMonth}-01`
  const monthEnd = new Date(y, m, 0).toISOString().slice(0, 10)

  const supabase = await createClient()

  // 1. Total income this month
  const { data: incomes } = await supabase
    .from('incomes')
    .select('amount')
    .eq('month', monthStart)

  // 2. Total expenses this month
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, category_id, expense_categories(name, color, group)')
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .eq('status', 'paid')

  // 3. Saving transactions this month
  const { data: savingTxs } = await supabase
    .from('saving_transactions')
    .select('amount, type')
    .gte('date', monthStart)
    .lte('date', monthEnd)

  // 4. Budgets this month
  const { data: budgets } = await supabase
    .from('budgets')
    .select('amount:estimated_amount, category_id, expense_categories(name, color)')
    .eq('month', monthStart)

  // 5. Upcoming installment schedules (next 7 days)
  const in7Days = new Date(now)
  in7Days.setDate(now.getDate() + 7)
  const todayStr = now.toISOString().slice(0, 10)
  const in7DaysStr = in7Days.toISOString().slice(0, 10)

  type UpcomingSchedule = {
    id: string
    due_date: string
    expected_amount: number
    installments: { name: string } | null
  }

  const { data: upcomingSchedulesRaw } = await supabase
    .from('installment_schedules')
    .select(`id, due_date, expected_amount, installments(name)`)
    .gte('due_date', todayStr)
    .lte('due_date', in7DaysStr)
    .order('due_date', { ascending: true })

  const upcomingSchedules = (upcomingSchedulesRaw ?? []) as unknown as UpcomingSchedule[]

  // Filter unpaid upcoming
  const { data: recentPayments } = await supabase
    .from('installment_payments')
    .select('schedule_id')
    .in(
      'schedule_id',
      upcomingSchedules.map((s) => s.id)
    )

  const paidIds = new Set((recentPayments ?? []).map((p) => p.schedule_id))
  const unpaidUpcoming = upcomingSchedules
    .filter((s) => !paidIds.has(s.id))
    .map((s) => ({
      id: s.id,
      name: s.installments?.name ?? 'Cicilan',
      due_date: s.due_date,
      expected_amount: Number(s.expected_amount),
    }))

  // Compute summaries
  const totalIncome = (incomes ?? []).reduce((s, i) => s + Number(i.amount), 0)
  const totalExpense = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0)
  const totalSavingIn = (savingTxs ?? [])
    .filter((t) => t.type === 'in')
    .reduce((s, t) => s + Number(t.amount), 0)
  const totalSavingOut = (savingTxs ?? [])
    .filter((t) => t.type === 'out')
    .reduce((s, t) => s + Number(t.amount), 0)
  const netSaving = totalSavingIn - totalSavingOut
  const sisaSaldo = totalIncome - totalExpense - totalSavingIn

  // Expense breakdown per category
  type ExpRow = { category_id: string | null; amount: number; expense_categories: { name: string; color: string | null; group: string } | null }
  const expRows = expenses as unknown as ExpRow[]
  const categoryMap: Record<string, { name: string; color: string | null; total: number }> = {}
  for (const e of expRows ?? []) {
    const key = e.category_id ?? 'uncategorized'
    const name = e.expense_categories?.name ?? 'Tanpa Kategori'
    const color = e.expense_categories?.color ?? '#94a3b8'
    if (!categoryMap[key]) categoryMap[key] = { name, color, total: 0 }
    categoryMap[key].total += Number(e.amount)
  }
  const pieData = Object.values(categoryMap).sort((a, b) => b.total - a.total)

  // Estimasi vs realisasi per category (from budgets)
  type BudgetRow = { amount: number; category_id: string | null; expense_categories: { name: string; color: string | null } | null }
  const budgetRows = budgets as unknown as BudgetRow[]
  const barData = (budgetRows ?? []).map((b) => ({
    name: b.expense_categories?.name ?? 'Lainnya',
    estimasi: Number(b.amount),
    realisasi: categoryMap[b.category_id ?? '']?.total ?? 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Ringkasan keuangan bulanan</p>
      </div>
      <DashboardClient
        activeMonth={activeMonth}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netSaving={netSaving}
        sisaSaldo={sisaSaldo}
        pieData={pieData}
        barData={barData}
        upcomingInstallments={unpaidUpcoming}
      />
    </div>
  )
}
