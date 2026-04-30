'use client'

import { useState, useTransition, useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createSavingTransaction, deleteSavingTransaction } from '@/app/actions/savings'
import { formatIDR, formatDate } from '@/lib/format'
import { PlusIcon, Trash2, ArrowLeft, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

type Goal = {
  id: string
  name: string
  target_amount: number | null
  target_date: string | null
  is_active: boolean
}

type Transaction = {
  id: string
  date: string
  type: 'in' | 'out'
  amount: number
  note: string | null
}

type State = { error?: string; success?: boolean } | undefined

interface Props {
  goal: Goal
  transactions: Transaction[]
  balance: number
}

function TxForm({ goalId, onSuccess }: { goalId: string; onSuccess: () => void }) {
  const action = (state: State, fd: FormData) => createSavingTransaction(goalId, fd)
  const [state, formAction, isPending] = useActionState<State, FormData>(action, undefined)
  if (state?.success) onSuccess()

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>
      )}
      <div className="space-y-2">
        <Label>Tipe</Label>
        <Select name="type" defaultValue="in">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="in">Setor (In)</SelectItem>
            <SelectItem value="out">Tarik (Out)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tx-amount">Nominal (Rp)</Label>
        <Input id="tx-amount" name="amount" type="number" min="0" step="10000" placeholder="0" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tx-date">Tanggal</Label>
        <Input id="tx-date" name="date" type="date" defaultValue={today} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tx-note">Catatan (opsional)</Label>
        <Input id="tx-note" name="note" placeholder="cth: transfer dari gaji" />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Menyimpan...' : 'Simpan Mutasi'}
      </Button>
    </form>
  )
}

export function SavingDetailClient({ goal, transactions, balance }: Props) {
  const [addOpen, setAddOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const progress =
    goal.target_amount && goal.target_amount > 0
      ? Math.min((balance / goal.target_amount) * 100, 100)
      : null

  const handleDelete = (id: string) => {
    if (!confirm('Hapus mutasi ini?')) return
    startTransition(async () => { await deleteSavingTransaction(id, goal.id) })
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/app/savings" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Semua Tabungan
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{goal.name}</h1>
        {!goal.is_active && <Badge variant="secondary" className="mt-1">Tidak Aktif</Badge>}
      </div>

      {/* Balance card */}
      <div className="rounded-xl border bg-card px-5 py-4 space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Saldo</p>
          <p className="text-3xl font-bold">{formatIDR(balance)}</p>
        </div>

        {goal.target_amount && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress?.toFixed(1)}% dari {formatIDR(goal.target_amount)}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            {goal.target_date && (
              <p className="text-xs text-muted-foreground">Target: {formatDate(goal.target_date)}</p>
            )}
          </div>
        )}
      </div>

      {/* Add transaction */}
      <div className="flex justify-end">
        <Drawer open={addOpen} onOpenChange={setAddOpen}>
          <DrawerTrigger asChild>
            <Button size="sm"><PlusIcon className="w-4 h-4 mr-1" />Tambah Mutasi</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader><DrawerTitle>Tambah Mutasi — {goal.name}</DrawerTitle></DrawerHeader>
            <div className="px-4 pb-6">
              <TxForm goalId={goal.id} onSuccess={() => setAddOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Transaction list */}
      <div>
        <h2 className="font-semibold mb-3">Riwayat Mutasi</h2>
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">Belum ada mutasi</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-full ${tx.type === 'in' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {tx.type === 'in'
                      ? <ArrowDownLeft className="w-4 h-4 text-green-600" />
                      : <ArrowUpRight className="w-4 h-4 text-red-600" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.note ?? (tx.type === 'in' ? 'Setor' : 'Tarik')}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${tx.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'in' ? '+' : '-'}{formatIDR(Number(tx.amount))}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(tx.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
