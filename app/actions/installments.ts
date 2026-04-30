'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const installmentSchema = z.object({
  name: z.string().min(1, 'Nama pinjaman wajib diisi').max(100),
  total_amount: z.coerce.number().positive('Hutang awal harus lebih dari 0'),
  monthly_amount: z.coerce.number().positive('Cicilan bulanan harus lebih dari 0'),
  tenor: z.coerce.number().int().positive().optional().nullable(),
  start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
  bank_id: z.string().uuid().optional().nullable(),
})

// Auto-generate schedules based on tenor + monthly_amount
function generateSchedules(
  installmentId: string,
  userId: string,
  startDate: string,
  tenor: number,
  monthlyAmount: number
) {
  const schedules = []
  const start = new Date(startDate)

  for (let i = 0; i < tenor; i++) {
    const dueDate = new Date(start.getFullYear(), start.getMonth() + i, start.getDate())
    schedules.push({
      installment_id: installmentId,
      user_id: userId,
      due_date: dueDate.toISOString().slice(0, 10),
      expected_amount: monthlyAmount,
    })
  }
  return schedules
}

export async function createInstallment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = installmentSchema.safeParse({
    name: formData.get('name'),
    total_amount: formData.get('total_amount'),
    monthly_amount: formData.get('monthly_amount'),
    tenor: formData.get('tenor') || null,
    start_date: formData.get('start_date'),
    bank_id: formData.get('bank_id') || null,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { tenor, ...data } = parsed.data

  const { data: inserted, error } = await supabase
    .from('installments')
    .insert({ user_id: user.id, tenor, ...data })
    .select('id')
    .single()

  if (error || !inserted) return { error: 'Gagal membuat cicilan.' }

  // Auto-generate schedules if tenor is provided
  if (tenor && tenor > 0) {
    const schedules = generateSchedules(
      inserted.id,
      user.id,
      data.start_date,
      tenor,
      data.monthly_amount
    )
    await supabase.from('installment_schedules').insert(schedules)
  }

  revalidatePath('/installments')
  return { success: true }
}

export async function updateInstallment(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = installmentSchema.safeParse({
    name: formData.get('name'),
    total_amount: formData.get('total_amount'),
    monthly_amount: formData.get('monthly_amount'),
    tenor: formData.get('tenor') || null,
    start_date: formData.get('start_date'),
    bank_id: formData.get('bank_id') || null,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('installments')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return { error: 'Gagal mengubah cicilan.' }

  revalidatePath('/installments')
  revalidatePath(`/installments/${id}`)
  return { success: true }
}

export async function toggleInstallmentActive(id: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('installments')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return { error: 'Gagal mengubah status cicilan.' }

  revalidatePath('/installments')
  return { success: true }
}

// ─── Payments ─────────────────────────────────────────────────────────────────

const paymentSchema = z.object({
  paid_date: z.string().min(1, 'Tanggal bayar wajib diisi'),
  amount: z.coerce.number().positive('Nominal harus lebih dari 0'),
  schedule_id: z.string().uuid().optional().nullable(),
  note: z.string().optional(),
})

export async function createInstallmentPayment(installmentId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = paymentSchema.safeParse({
    paid_date: formData.get('paid_date'),
    amount: formData.get('amount'),
    schedule_id: formData.get('schedule_id') || null,
    note: formData.get('note') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase.from('installment_payments').insert({
    user_id: user.id,
    installment_id: installmentId,
    ...parsed.data,
  })
  if (error) return { error: 'Gagal menambah pembayaran.' }

  revalidatePath(`/installments/${installmentId}`)
  revalidatePath('/installments')
  return { success: true }
}

export async function deleteInstallmentPayment(id: string, installmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('installment_payments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return { error: 'Gagal menghapus pembayaran.' }

  revalidatePath(`/installments/${installmentId}`)
  revalidatePath('/installments')
  return { success: true }
}
