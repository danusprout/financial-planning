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

  const { error } = await supabase.from('budgets').upsert(
    {
      user_id: user.id,
      month: monthDate,
      category_id: categoryId,
      estimated_amount: amount,
    },
    {
      onConflict: 'user_id,month,category_id',
    }
  )

  if (error) return { error: 'Gagal menyimpan anggaran.' }
  revalidatePath('/budget')
  return { success: true }
}
