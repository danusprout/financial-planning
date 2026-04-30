'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const incomeSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format bulan tidak valid (YYYY-MM)'),
  source: z.string().min(1, 'Sumber pemasukan wajib diisi').max(100),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  note: z.string().optional(),
})

export async function createIncome(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = incomeSchema.safeParse({
    month: formData.get('month'),
    source: formData.get('source'),
    amount: formData.get('amount'),
    note: formData.get('note') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { month, source, amount, note } = parsed.data
  const monthDate = `${month}-01`

  const { error } = await supabase.from('incomes').insert({
    user_id: user.id,
    month: monthDate,
    source,
    amount,
    note,
  })
  if (error) return { error: 'Gagal menambah pemasukan.' }

  revalidatePath('/income')
  return { success: true }
}

export async function updateIncome(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = incomeSchema.safeParse({
    month: formData.get('month'),
    source: formData.get('source'),
    amount: formData.get('amount'),
    note: formData.get('note') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { month, source, amount, note } = parsed.data

  const { error } = await supabase
    .from('incomes')
    .update({ month: `${month}-01`, source, amount, note })
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return { error: 'Gagal mengubah pemasukan.' }

  revalidatePath('/income')
  return { success: true }
}

export async function deleteIncome(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('incomes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return { error: 'Gagal menghapus pemasukan.' }

  revalidatePath('/income')
  return { success: true }
}
