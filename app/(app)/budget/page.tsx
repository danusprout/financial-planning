import { createClient } from '@/lib/supabase/server'
import { BudgetClient } from './BudgetClient'

interface Props {
  searchParams: Promise<{ month?: string }>
}

export default async function BudgetPage({ searchParams }: Props) {
  const { month } = await searchParams
  const now = new Date()
  const activeMonth =
    month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [y, m] = activeMonth.split('-').map(Number)
  const monthStart = `${activeMonth}-01`
  const monthEnd = new Date(y, m, 0).toISOString().slice(0, 10)

  const supabase = await createClient()

  // 1. Expense categories (public + user's own)
  const { data: categories } = await supabase
    .from('expense_categories')
    .select('id, name, color, group')
    .order('group', { ascending: true })
    .order('name', { ascending: true })

  // 2. Budgets for the month
  const { data: budgets } = await supabase
    .from('budgets')
    .select('category_id, estimated_amount')
    .eq('month', monthStart)

  // 3. Paid expenses for the month → group by category_id for realisasi
  const { data: expenses } = await supabase
    .from('expenses')
    .select('category_id, amount')
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .eq('status', 'paid')

  // 4. Incomes for the month
  const { data: incomes } = await supabase
    .from('incomes')
    .select('id, source, amount, note')
    .eq('month', monthStart)

  // 5. Saving goals (active)
  const { data: savingGoals } = await supabase
    .from('saving_goals')
    .select('id, name, target_amount, target_date')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  // 6. Saving transactions this month
  const { data: savingTxs } = await supabase
    .from('saving_transactions')
    .select('goal_id, type, amount')
    .gte('date', monthStart)
    .lte('date', monthEnd)

  // 7. Active installments
  const { data: installments } = await supabase
    .from('installments')
    .select('id, name, monthly_amount')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  // 8. Installment payments this month
  const { data: installmentPayments } = await supabase
    .from('installment_payments')
    .select('installment_id, amount')
    .gte('paid_date', monthStart)
    .lte('paid_date', monthEnd)

  // ─── Aggregate data ───────────────────────────────────────────────────────

  // Budget map: category_id → estimated_amount
  const budgetMap: Record<string, number> = {}
  for (const b of budgets ?? []) {
    if (b.category_id) budgetMap[b.category_id] = Number(b.estimated_amount)
  }

  // Expense realisasi map: category_id → sum of paid amounts
  const expenseRealisasiMap: Record<string, number> = {}
  for (const e of expenses ?? []) {
    const key = e.category_id ?? 'uncategorized'
    expenseRealisasiMap[key] = (expenseRealisasiMap[key] ?? 0) + Number(e.amount)
  }

  // Saving realisasi per goal: goal_id → net amount (in - out)
  const savingRealisasiMap: Record<string, number> = {}
  for (const tx of savingTxs ?? []) {
    const delta = tx.type === 'in' ? Number(tx.amount) : -Number(tx.amount)
    savingRealisasiMap[tx.goal_id] = (savingRealisasiMap[tx.goal_id] ?? 0) + delta
  }

  // Installment realisasi: installment_id → sum of payments this month
  const installmentRealisasiMap: Record<string, number> = {}
  for (const p of installmentPayments ?? []) {
    installmentRealisasiMap[p.installment_id] =
      (installmentRealisasiMap[p.installment_id] ?? 0) + Number(p.amount)
  }

  return (
    <BudgetClient
      activeMonth={activeMonth}
      categories={categories ?? []}
      budgetMap={budgetMap}
      expenseRealisasiMap={expenseRealisasiMap}
      incomes={incomes ?? []}
      savingGoals={savingGoals ?? []}
      savingRealisasiMap={savingRealisasiMap}
      installments={installments ?? []}
      installmentRealisasiMap={installmentRealisasiMap}
    />
  )
}
