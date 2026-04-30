import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { renderInstallmentReminder } from '@/lib/email/templates'
import { sendEmail } from '@/lib/email/send'

// Vercel Cron: 0 2 * * * UTC = 09:00 WIB
// Protected by CRON_SECRET header (Vercel injects automatically)
export async function GET(request: Request) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date()
  const in3Days = new Date(today)
  in3Days.setDate(today.getDate() + 3)

  const todayStr = today.toISOString().slice(0, 10)
  const in3DaysStr = in3Days.toISOString().slice(0, 10)

  // Get all upcoming unpaid schedules
  const { data: schedules, error } = await supabase
    .from('installment_schedules')
    .select(`
      id,
      due_date,
      expected_amount,
      user_id,
      installment_id,
      installments ( name ),
      installment_payments ( id, schedule_id )
    `)
    .gte('due_date', todayStr)
    .lte('due_date', in3DaysStr)

  if (error) {
    console.error('[cron/installment-reminders] query error:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  // Filter out already-paid schedules
  const unpaid = (schedules ?? []).filter((s) => {
    const payments: { schedule_id: string | null }[] = (s.installment_payments as { schedule_id: string | null }[]) ?? []
    return !payments.some((p) => p.schedule_id === s.id)
  })

  if (unpaid.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Group by user_id
  const byUser: Record<
    string,
    { installmentName: string; dueDate: string; expectedAmount: number }[]
  > = {}

  for (const s of unpaid) {
    const inst = s.installments as { name: string } | null
    if (!byUser[s.user_id]) byUser[s.user_id] = []
    byUser[s.user_id].push({
      installmentName: inst?.name ?? 'Cicilan',
      dueDate: s.due_date,
      expectedAmount: Number(s.expected_amount),
    })
  }

  let sent = 0
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  for (const [userId, items] of Object.entries(byUser)) {
    // Get user email from auth.users
    const { data: userData } = await supabase.auth.admin.getUserById(userId)
    const email = userData?.user?.email
    const fullName =
      (userData?.user?.user_metadata?.full_name as string | undefined) ?? 'Pengguna'

    if (!email) continue

    const html = renderInstallmentReminder({ userName: fullName, items, appUrl })

    const result = await sendEmail({
      to: email,
      subject: `⏰ ${items.length} cicilan jatuh tempo dalam 3 hari`,
      html,
    })

    if (result.success) sent++
    else console.error(`[cron] failed to send to ${email}:`, result.error)
  }

  return NextResponse.json({ sent, total: Object.keys(byUser).length })
}
