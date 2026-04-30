import { createClient } from '@/lib/supabase/server'
import { InstallmentsListClient } from './InstallmentsListClient'

export default async function InstallmentsPage() {
  const supabase = await createClient()

  const { data: installments } = await supabase
    .from('installments')
    .select(`
      *,
      banks ( id, name ),
      installment_payments ( amount )
    `)
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: true })

  const rows = (installments ?? []).map((inst) => {
    const totalPaid = (inst.installment_payments ?? []).reduce(
      (sum: number, p: { amount: number }) => sum + Number(p.amount),
      0
    )
    const remaining = Math.max(Number(inst.total_amount) - totalPaid, 0)
    const progressPct =
      Number(inst.total_amount) > 0
        ? Math.min((totalPaid / Number(inst.total_amount)) * 100, 100)
        : 0
    const status = remaining <= 0 ? 'LUNAS' : 'BELUM LUNAS'

    return {
      id: inst.id,
      name: inst.name,
      total_amount: Number(inst.total_amount),
      monthly_amount: Number(inst.monthly_amount),
      tenor: inst.tenor,
      start_date: inst.start_date,
      is_active: inst.is_active,
      bank: inst.banks,
      totalPaid,
      remaining,
      progressPct,
      status,
    }
  })

  const { data: banks } = await supabase.from('banks').select('id, name, type').order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cicilan & Hutang</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola pinjaman dan jadwal pembayaran</p>
      </div>
      <InstallmentsListClient rows={rows} banks={banks ?? []} />
    </div>
  )
}
