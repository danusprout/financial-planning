'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// ─── Saving Goals ─────────────────────────────────────────────────────────────

const goalSchema = z.object({
  name: z.string().min(1, 'Nama tujuan wajib diisi').max(100),
  target_amount: z.coerce.number().positive().optional().nullable(),
  target_date: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

export async function createGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = goalSchema.safeParse({
    name: formData.get('name'),
    target_amount: formData.get('target_amount') || null,
    target_date: formData.get('target_date') || null,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase.from('saving_goals').insert({
    user_id: user.id,
    ...parsed.data,
  })
  if (error) return { error: 'Gagal membuat tujuan tabungan.' }

  revalidatePath('/savings')
  return { success: true }
}

export async function updateGoal(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = goalSchema.safeParse({
    name: formData.get('name'),
    target_amount: formData.get('target_amount') || null,
    target_date: formData.get('target_date') || null,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('saving_goals')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return { error: 'Gagal mengubah tujuan tabungan.' }

  revalidatePath('/savings')
  revalidatePath(`/savings/${id}`)
  return { success: true }
}

export async function toggleGoalActive(id: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('saving_goals')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return { error: 'Gagal mengubah status tabungan.' }

  revalidatePath('/savings')
  return { success: true }
}

// ─── Saving Transactions ──────────────────────────────────────────────────────

const txSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  type: z.enum(['in', 'out']),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  note: z.string().optional(),
})

export async function createSavingTransaction(goalId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = txSchema.safeParse({
    date: formData.get('date'),
    type: formData.get('type'),
    amount: formData.get('amount'),
    note: formData.get('note') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase.from('saving_transactions').insert({
    user_id: user.id,
    goal_id: goalId,
    ...parsed.data,
  })
  if (error) return { error: 'Gagal menambah mutasi tabungan.' }

  revalidatePath(`/savings/${goalId}`)
  revalidatePath('/savings')
  return { success: true }
}

export async function deleteSavingTransaction(id: string, goalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('saving_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return { error: 'Gagal menghapus mutasi.' }

  revalidatePath(`/savings/${goalId}`)
  revalidatePath('/savings')
  return { success: true }
}
