import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InstallmentDetailClient } from './InstallmentDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InstallmentDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: installment } = await supabase
    .from('installments')
    .select(`*, banks ( id, name )`)
    .eq('id', id)
    .single()

  if (!installment) notFound()

  const { data: schedules } = await supabase
    .from('installment_schedules')
    .select('*')
    .eq('installment_id', id)
    .order('due_date', { ascending: true })

  const { data: payments } = await supabase
    .from('installment_payments')
    .select('*')
    .eq('installment_id', id)
    .order('paid_date', { ascending: false })

  const totalPaid = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
  const remaining = Math.max(Number(installment.total_amount) - totalPaid, 0)
  const progressPct =
    Number(installment.total_amount) > 0
      ? Math.min((totalPaid / Number(installment.total_amount)) * 100, 100)
      : 0

  // Find nearest unpaid schedule (for auto-suggest)
  const paidScheduleIds = new Set(
    (payments ?? []).filter((p) => p.schedule_id).map((p) => p.schedule_id)
  )
  const nextUnpaidSchedule = (schedules ?? []).find(
    (s) => !paidScheduleIds.has(s.id) && new Date(s.due_date) >= new Date()
  ) ?? (schedules ?? []).find((s) => !paidScheduleIds.has(s.id))

  return (
    <InstallmentDetailClient
      installment={{
        ...installment,
        total_amount: Number(installment.total_amount),
        monthly_amount: Number(installment.monthly_amount),
      }}
      schedules={(schedules ?? []).map((s) => ({
        ...s,
        expected_amount: Number(s.expected_amount),
        isPaid: paidScheduleIds.has(s.id),
      }))}
      payments={(payments ?? []).map((p) => ({
        ...p,
        amount: Number(p.amount),
      }))}
      totalPaid={totalPaid}
      remaining={remaining}
      progressPct={progressPct}
      nextUnpaidSchedule={nextUnpaidSchedule
        ? { ...nextUnpaidSchedule, expected_amount: Number(nextUnpaidSchedule.expected_amount) }
        : null}
    />
  )
}
