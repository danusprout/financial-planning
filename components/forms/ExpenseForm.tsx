'use client'

import { useActionState, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
        <Select
          value={categoryValue}
          onValueChange={(value) => setCategoryValue(value ?? UNASSIGNED_VALUE)}
        >
          <SelectTrigger id="exp-category">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED_VALUE}>— Tanpa kategori —</SelectItem>
            {['needs', 'wants', 'obligations'].map((group) => {
              const items = categories.filter((c) => c.group === group)
              if (items.length === 0) return null
              return (
                <div key={group}>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    {group}
                  </div>
                  {items.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </div>
              )
            })}
          </SelectContent>
        </Select>
        <input
          type="hidden"
          name="category_id"
          value={categoryValue === UNASSIGNED_VALUE ? '' : categoryValue}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exp-bank">Sumber Dana</Label>
        <Select
          value={bankValue}
          onValueChange={(value) => setBankValue(value ?? UNASSIGNED_VALUE)}
        >
          <SelectTrigger id="exp-bank">
            <SelectValue placeholder="Pilih sumber dana" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED_VALUE}>— Tanpa sumber dana —</SelectItem>
            {banks.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="hidden"
          name="bank_id"
          value={bankValue === UNASSIGNED_VALUE ? '' : bankValue}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exp-status">Status</Label>
        <Select name="status" defaultValue={defaultValues?.status ?? 'paid'}>
          <SelectTrigger id="exp-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Pengeluaran'}
      </Button>
    </form>
  )
}
