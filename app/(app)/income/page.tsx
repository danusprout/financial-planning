import { createClient } from '@/lib/supabase/server'
import { IncomeClient } from './IncomeClient'

interface Props {
  searchParams: Promise<{ month?: string }>
}

export default async function IncomePage({ searchParams }: Props) {
  const { month } = await searchParams

  // Default: current month YYYY-MM
  const now = new Date()
  const activeMonth = month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthDate = `${activeMonth}-01`

  const supabase = await createClient()

  const { data: incomes } = await supabase
    .from('incomes')
    .select('*')
    .eq('month', monthDate)
    .order('created_at', { ascending: false })

  const total = (incomes ?? []).reduce((sum, i) => sum + Number(i.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pemasukan</h1>
        <p className="text-sm text-muted-foreground mt-1">Catat sumber pemasukan per bulan</p>
      </div>
      <IncomeClient
        incomes={incomes ?? []}
        total={total}
        activeMonth={activeMonth}
      />
    </div>
  )
}
