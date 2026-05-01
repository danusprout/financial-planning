'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Upsert a budget estimate for an expense category in a given month.
 * month format: "YYYY-MM"
 */
export async function upsertBudget(categoryId: string, month: string, amount: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const monthDate = `${month}-01`

  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user.id)
    .eq('month', monthDate)
    .eq('category_id', categoryId)
    .maybeSingle()

  const budgetPayload = {
    user_id: user.id,
    month: monthDate,
    category_id: categoryId,
    estimated_amount: amount,
  }

  const { error } = existing
    ? await supabase.from('budgets').update({ estimated_amount: amount }).eq('id', existing.id)
    : await supabase.from('budgets').insert(budgetPayload)

  if (error) return { error: 'Gagal menyimpan anggaran.' }
  revalidatePath('/budget')
  return { success: true }
}

export async function upsertBudgetBank(categoryId: string, month: string, bankId: string | null) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const monthDate = `${month}-01`

  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user.id)
    .eq('month', monthDate)
    .eq('category_id', categoryId)
    .maybeSingle()

  const { error } = existing
    ? await supabase.from('budgets').update({ bank_id: bankId }).eq('id', existing.id)
    : await supabase.from('budgets').insert({
        user_id: user.id,
        month: monthDate,
        category_id: categoryId,
        estimated_amount: 0,
        bank_id: bankId,
      })

  if (error) return { error: 'Gagal menyimpan sumber dana anggaran.' }
  revalidatePath('/budget')
  return { success: true }
}
