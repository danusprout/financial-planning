import { createClient } from '@/lib/supabase/server'
import { SavingsClient } from './SavingsClient'

export default async function SavingsPage() {
  const supabase = await createClient()

  // All goals with all their transactions
  const { data: goals } = await supabase
    .from('saving_goals')
    .select(`*, saving_transactions ( id, date, type, amount, note, created_at )`)
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: true })

  const goalsData = (goals ?? []).map((g) => {
    const txs: { id: string; date: string; type: string; amount: number; note: string | null; created_at: string }[] =
      (g.saving_transactions ?? []).map((t: { id: string; date: string; type: string; amount: number | string; note: string | null; created_at: string }) => ({
        ...t,
        amount: Number(t.amount),
      }))
    const balance = txs.reduce((s, t) => s + (t.type === 'in' ? t.amount : -t.amount), 0)
    return {
      id: g.id as string,
      name: g.name as string,
      target_amount: g.target_amount ? Number(g.target_amount) : null,
      target_date: g.target_date as string | null,
      is_active: g.is_active as boolean,
      balance,
      transactions: txs,
    }
  })

  return (
    <SavingsClient goals={goalsData} />
  )
}
