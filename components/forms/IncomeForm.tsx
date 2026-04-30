'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createIncome, updateIncome } from '@/app/actions/income'

type State = { error?: string; success?: boolean } | undefined

interface IncomeFormProps {
  onSuccess?: () => void
  editId?: string
  defaultValues?: {
    month: string   // YYYY-MM
    source: string
    amount: number
    note?: string
  }
  defaultMonth?: string  // YYYY-MM — pre-fill when adding
}

export function IncomeForm({ onSuccess, editId, defaultValues, defaultMonth }: IncomeFormProps) {
  const action = editId
    ? (_: State, fd: FormData) => updateIncome(editId, fd)
    : (_: State, fd: FormData) => createIncome(fd)

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
        <Label htmlFor="inc-month">Bulan</Label>
        <Input
          id="inc-month"
          name="month"
          type="month"
          defaultValue={defaultValues?.month ?? defaultMonth}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inc-source">Sumber</Label>
        <Input
          id="inc-source"
          name="source"
          placeholder="cth: Gaji, THR, Freelance"
          defaultValue={defaultValues?.source}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inc-amount">Nominal (Rp)</Label>
        <Input
          id="inc-amount"
          name="amount"
          type="number"
          min="0"
          step="1000"
          placeholder="0"
          defaultValue={defaultValues?.amount}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inc-note">Catatan (opsional)</Label>
        <Input
          id="inc-note"
          name="note"
          placeholder="cth: Gaji bulan April"
          defaultValue={defaultValues?.note}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Pemasukan'}
      </Button>
    </form>
  )
}
