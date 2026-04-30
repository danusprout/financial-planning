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
import { createCategory, updateCategory } from '@/app/actions/settings'

type State = { error?: string; success?: boolean } | undefined

interface CategoryFormProps {
  onSuccess?: () => void
  editId?: string
  defaultValues?: {
    name: string
    group: 'needs' | 'wants' | 'obligations'
    color?: string
  }
}

const GROUP_LABELS = {
  needs: 'Kebutuhan (Needs)',
  wants: 'Keinginan (Wants)',
  obligations: 'Kewajiban (Obligations)',
}

export function CategoryForm({ onSuccess, editId, defaultValues }: CategoryFormProps) {
  const action = editId
    ? (_: State, formData: FormData) => updateCategory(editId, formData)
    : (_: State, formData: FormData) => createCategory(formData)

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
        <Label htmlFor="cat-name">Nama Kategori</Label>
        <Input
          id="cat-name"
          name="name"
          placeholder="cth: Belanja Online"
          defaultValue={defaultValues?.name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-group">Kelompok</Label>
        <Select name="group" defaultValue={defaultValues?.group ?? 'needs'}>
          <SelectTrigger id="cat-group">
            <SelectValue placeholder="Pilih kelompok" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GROUP_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-color">Warna (opsional)</Label>
        <Input
          id="cat-color"
          name="color"
          type="color"
          defaultValue={defaultValues?.color ?? '#6b7280'}
          className="h-10 w-full cursor-pointer"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Kategori'}
      </Button>
    </form>
  )
}
