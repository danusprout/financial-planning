import { createClient } from '@/lib/supabase/server'
import { ExpensesClient } from './ExpensesClient'

interface Props {
  searchParams: Promise<{ month?: string; category?: string; bank?: string }>
}

export default async function ExpensesPage({ searchParams }: Props) {
  const { month, category, bank } = await searchParams

  const now = new Date()
  const activeMonth = month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthStart = `${activeMonth}-01`
  // Last day of month
  const [y, m] = activeMonth.split('-').map(Number)
  const monthEnd = new Date(y, m, 0).toISOString().slice(0, 10)

  const supabase = await createClient()

  // Expenses with category and bank join
  let query = supabase
    .from('expenses')
    .select(`
      *,
      expense_categories ( id, name, color, group ),
      banks ( id, name, type )
    `)
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category_id', category)
  if (bank) query = query.eq('bank_id', bank)

  const { data: expenses } = await query

  // For filters
  const { data: categories } = await supabase
    .from('expense_categories')
    .select('id, name, group, color')
    .order('name')

  const { data: banks } = await supabase
    .from('banks')
    .select('id, name, type')
    .order('name')

  const total = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengeluaran Harian</h1>
        <p className="text-sm text-muted-foreground mt-1">Log pengeluaran per hari</p>
      </div>
      <ExpensesClient
        expenses={expenses ?? []}
        categories={categories ?? []}
        banks={banks ?? []}
        total={total}
        activeMonth={activeMonth}
        filterCategory={category}
        filterBank={bank}
      />
    </div>
  )
}
