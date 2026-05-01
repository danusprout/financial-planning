'use client'

import { useActionState, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createExpense, updateExpense } from '@/app/actions/expenses'

type State = { error?: string; success?: boolean } | undefined

type Category = { id: string; name: string; group: string; color: string | null }
type Bank = { id: string; name: string; type: string }

const UNASSIGNED_VALUE = '__none__'

interface ExpenseFormProps {
  onSuccess?: () => void
  editId?: string
  defaultValues?: {
    date: string
    category_id?: string | null
    bank_id?: string | null
    amount: number
    description: string
    status: 'planned' | 'paid' | 'pending'
  }
  defaultDate?: string  // YYYY-MM-DD
  categories: Category[]
  banks: Bank[]
}

const STATUS_LABELS = {
  paid: 'Sudah dibayar',
  pending: 'Pending',
  planned: 'Direncanakan',
}

const nativeSelectClassName =
  'flex h-11 w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 text-sm text-slate-900 outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50'

export function ExpenseForm({
  onSuccess,
  editId,
  defaultValues,
  defaultDate,
  categories,
  banks,
}: ExpenseFormProps) {
  const action = editId
    ? (_: State, fd: FormData) => updateExpense(editId, fd)
    : (_: State, fd: FormData) => createExpense(fd)

  const [state, formAction, isPending] = useActionState<State, FormData>(action, undefined)

  if (state?.success) onSuccess?.()

  const [categoryValue, setCategoryValue] = useState(defaultValues?.category_id ?? UNASSIGNED_VALUE)
  const [bankValue, setBankValue] = useState(defaultValues?.bank_id ?? UNASSIGNED_VALUE)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="exp-date">Tanggal</Label>
        <Input
          id="exp-date"
          name="date"
          type="date"
          defaultValue={defaultValues?.date ?? defaultDate}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exp-desc">Deskripsi</Label>
        <Input
          id="exp-desc"
          name="description"
          placeholder="cth: kopi family mart, bensin mobil"
          defaultValue={defaultValues?.description}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exp-amount">Nominal (Rp)</Label>
        <Input
          id="exp-amount"
          name="amount"
          type="number"
          min="0"
          step="500"
          placeholder="0"
          defaultValue={defaultValues?.amount}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exp-category">Kategori</Label>
        <select
          id="exp-category"
          name="category_id"
          className={nativeSelectClassName}
          value={categoryValue === UNASSIGNED_VALUE ? '' : categoryValue}
          onChange={(event) => setCategoryValue(event.target.value || UNASSIGNED_VALUE)}
        >
          <option value="">— Tanpa kategori —</option>
          {['needs', 'wants', 'obligations'].map((group) => {
            const items = categories.filter((c) => c.group === group)
            if (items.length === 0) return null

            return (
              <optgroup key={group} label={group.toUpperCase()}>
                {items.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            )
          })}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="exp-bank">Sumber Dana</Label>
        <select
          id="exp-bank"
          name="bank_id"
          className={nativeSelectClassName}
          value={bankValue === UNASSIGNED_VALUE ? '' : bankValue}
          onChange={(event) => setBankValue(event.target.value || UNASSIGNED_VALUE)}
        >
          <option value="">— Tanpa sumber dana —</option>
          {banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="exp-status">Status</Label>
        <select
          id="exp-status"
          name="status"
          className={nativeSelectClassName}
          defaultValue={defaultValues?.status ?? 'paid'}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Pengeluaran'}
      </Button>
    </form>
  )
}
