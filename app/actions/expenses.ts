'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const expenseSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  category_id: z.string().uuid().optional().nullable(),
  bank_id: z.string().uuid().optional().nullable(),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  description: z.string().min(1, 'Deskripsi wajib diisi').max(200),
  status: z.enum(['planned', 'paid', 'pending']).default('paid'),
})

export async function createExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = expenseSchema.safeParse({
    date: formData.get('date'),
    category_id: formData.get('category_id') || null,
    bank_id: formData.get('bank_id') || null,
    amount: formData.get('amount'),
    description: formData.get('description'),
    status: formData.get('status') || 'paid',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    ...parsed.data,
  })
  if (error) return { error: 'Gagal menambah pengeluaran.' }

  revalidatePath('/expenses')
  return { success: true }
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = expenseSchema.safeParse({
    date: formData.get('date'),
    category_id: formData.get('category_id') || null,
    bank_id: formData.get('bank_id') || null,
    amount: formData.get('amount'),
    description: formData.get('description'),
    status: formData.get('status') || 'paid',
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('expenses')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return { error: 'Gagal mengubah pengeluaran.' }

  revalidatePath('/expenses')
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return { error: 'Gagal menghapus pengeluaran.' }

  revalidatePath('/expenses')
  return { success: true }
}
