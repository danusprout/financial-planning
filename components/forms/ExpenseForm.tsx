'use client'

import { useActionState } from 'react'
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
        <Select name="category_id" defaultValue={defaultValues?.category_id ?? ''}>
          <SelectTrigger id="exp-category">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">— Tanpa kategori —</SelectItem>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="exp-bank">Sumber Dana</Label>
        <Select name="bank_id" defaultValue={defaultValues?.bank_id ?? ''}>
          <SelectTrigger id="exp-bank">
            <SelectValue placeholder="Pilih sumber dana" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">— Tanpa sumber dana —</SelectItem>
            {banks.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
