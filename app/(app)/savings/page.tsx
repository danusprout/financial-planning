import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SavingsListClient } from './SavingsListClient'

export default async function SavingsPage() {
  const supabase = await createClient()

  const { data: goals } = await supabase
    .from('saving_goals')
    .select(`
      *,
      saving_transactions ( amount, type )
    `)
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: true })

  // Compute saldo per goal
  const goalsWithBalance = (goals ?? []).map((g) => {
    const txs: { amount: number; type: string }[] = g.saving_transactions ?? []
    const balance = txs.reduce(
      (sum, t) => sum + (t.type === 'in' ? Number(t.amount) : -Number(t.amount)),
      0
    )
    return { ...g, balance }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tabungan</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola tujuan tabungan kamu</p>
      </div>
      <SavingsListClient goals={goalsWithBalance} />
    </div>
  )
}
