import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SavingDetailClient } from './SavingDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SavingDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: goal } = await supabase
    .from('saving_goals')
    .select('*')
    .eq('id', id)
    .single()

  if (!goal) notFound()

  const { data: transactions } = await supabase
    .from('saving_transactions')
    .select('*')
    .eq('goal_id', id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  const txs = transactions ?? []
  const balance = txs.reduce(
    (sum, t) => sum + (t.type === 'in' ? Number(t.amount) : -Number(t.amount)),
    0
  )

  return (
    <div className="space-y-6">
      <SavingDetailClient goal={goal} transactions={txs} balance={balance} />
    </div>
  )
}
