'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// ─── Expense Categories ───────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi').max(50),
  group: z.enum(['needs', 'wants', 'obligations']),
  color: z.string().optional(),
})

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    group: formData.get('group'),
    color: formData.get('color') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('expense_categories')
    .insert({ ...parsed.data, user_id: user.id })

  if (error) return { error: 'Gagal menambah kategori.' }

  revalidatePath('/app/settings/categories')
  return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    group: formData.get('group'),
    color: formData.get('color') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('expense_categories')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)  // only own custom categories

  if (error) return { error: 'Gagal mengubah kategori.' }

  revalidatePath('/app/settings/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('expense_categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)  // only own custom categories

  if (error) return { error: 'Gagal menghapus kategori.' }

  revalidatePath('/app/settings/categories')
  return { success: true }
}

// ─── Banks ────────────────────────────────────────────────────────────────────

const bankSchema = z.object({
  name: z.string().min(1, 'Nama bank wajib diisi').max(50),
  type: z.enum(['bank', 'ewallet', 'cash', 'credit']),
  color: z.string().optional(),
})

export async function createBank(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = bankSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    color: formData.get('color') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('banks')
    .insert({ ...parsed.data, user_id: user.id })

  if (error) return { error: 'Gagal menambah bank.' }

  revalidatePath('/app/settings/banks')
  return { success: true }
}

export async function updateBank(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = bankSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    color: formData.get('color') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('banks')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)  // only own custom banks

  if (error) return { error: 'Gagal mengubah bank.' }

  revalidatePath('/app/settings/banks')
  return { success: true }
}

export async function deleteBank(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('banks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)  // only own custom banks

  if (error) return { error: 'Gagal menghapus bank.' }

  revalidatePath('/app/settings/banks')
  return { success: true }
}
