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
import { createBank, updateBank } from '@/app/actions/settings'

type State = { error?: string; success?: boolean } | undefined

interface BankFormProps {
  onSuccess?: () => void
  editId?: string
  defaultValues?: {
    name: string
    type: 'bank' | 'ewallet' | 'cash' | 'credit'
    color?: string
  }
}

const TYPE_LABELS = {
  bank: 'Bank',
  ewallet: 'E-Wallet',
  cash: 'Tunai (Cash)',
  credit: 'Kartu Kredit',
}

export function BankForm({ onSuccess, editId, defaultValues }: BankFormProps) {
  const action = editId
    ? (state: State, formData: FormData) => updateBank(editId, formData)
    : createBank

  const [state, formAction, isPending] = useActionState<State, FormData>(action, undefined)

  if (state?.success && onSuccess) {
    onSuccess()
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="bank-name">Nama</Label>
        <Input
          id="bank-name"
          name="name"
          placeholder="cth: BCA Tabungan"
          defaultValue={defaultValues?.name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bank-type">Tipe</Label>
        <Select name="type" defaultValue={defaultValues?.type ?? 'bank'}>
          <SelectTrigger id="bank-type">
            <SelectValue placeholder="Pilih tipe" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bank-color">Warna (opsional)</Label>
        <Input
          id="bank-color"
          name="color"
          type="color"
          defaultValue={defaultValues?.color ?? '#6b7280'}
          className="h-10 w-full cursor-pointer"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Bank'}
      </Button>
    </form>
  )
}
