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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { createSavingTransaction, updateSavingTransaction, deleteSavingTransaction, updateGoal } from '@/app/actions/savings'
import { formatIDR, formatDate } from '@/lib/format'
import { useLang } from '@/lib/i18n'
import { PlusIcon, Pencil, Trash2, ArrowLeft, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

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

// ─── TxForm (shared for create & edit) ───────────────────────────────────────

interface TxFormProps {
  goalId: string
  editTx?: Transaction
  onSuccess: () => void
}

function TxForm({ goalId, editTx, onSuccess }: TxFormProps) {
  const { t } = useLang()
  const [txType, setTxType] = useState<'in' | 'out'>(editTx?.type ?? 'in')

  const action = (state: State, fd: FormData) =>
    editTx
      ? updateSavingTransaction(editTx.id, goalId, fd)
      : createSavingTransaction(goalId, fd)

  const [state, formAction, isPending] = useActionState<State, FormData>(action, undefined)
  if (state?.success) onSuccess()

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>
      )}

      {/* Type selector — manual display to avoid @base-ui portal label issue */}
      <div className="space-y-2">
        <Label>{t.amount.replace(' (Rp)', '') /* reuse — just "Amount" / "Jumlah" */}</Label>
        <Select name="type" value={txType} onValueChange={(v) => setTxType(v as 'in' | 'out')}>
          <SelectTrigger>
            <span className="text-sm">
              {txType === 'in' ? `${t.deposit} (In)` : `${t.withdraw} (Out)`}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in">{t.deposit} (In)</SelectItem>
            <SelectItem value="out">{t.withdraw} (Out)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tx-amount">{t.amount}</Label>
        <Input
          id="tx-amount"
          name="amount"
          type="number"
          min="0"
          step="10000"
          placeholder="0"
          defaultValue={editTx?.amount}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tx-date">{t.startDateLabel.replace('Start ', '')}</Label>
        <Input
          id="tx-date"
          name="date"
          type="date"
          defaultValue={editTx?.date ?? today}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tx-note">{t.note}</Label>
        <Input
          id="tx-note"
          name="note"
          placeholder="cth: transfer dari gaji"
          defaultValue={editTx?.note ?? ''}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t.savingLabel : editTx ? 'Simpan Perubahan' : 'Simpan Mutasi'}
      </Button>
    </form>
  )
}

interface GoalFormProps {
  goal: Goal
  onSuccess: () => void
}

function GoalForm({ goal, onSuccess }: GoalFormProps) {
  const action = (_: State, fd: FormData) => updateGoal(goal.id, fd)
  const [state, formAction, isPending] = useActionState<State, FormData>(action, undefined)

  if (state?.success) onSuccess()

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="goal-name">Nama Goal</Label>
        <Input
          id="goal-name"
          name="name"
          defaultValue={goal.name}
          placeholder="cth: Dana darurat"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-target-amount">Target Nominal (Rp)</Label>
        <Input
          id="goal-target-amount"
          name="target_amount"
          type="number"
          min="0"
          step="10000"
          defaultValue={goal.target_amount ?? ''}
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-target-date">Target Tanggal</Label>
        <Input
          id="goal-target-date"
          name="target_date"
          type="date"
          defaultValue={goal.target_date ?? ''}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Menyimpan...' : 'Simpan Perubahan Goal'}
      </Button>
    </form>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SavingDetailClient({ goal, transactions, balance }: {
  goal: Goal
  transactions: Transaction[]
  balance: number
}) {
  const { t } = useLang()
  const [addOpen, setAddOpen] = useState(false)
  const [editGoalOpen, setEditGoalOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [isPending, startTransition] = useTransition()

  const progress =
    goal.target_amount && goal.target_amount > 0
      ? Math.min((balance / goal.target_amount) * 100, 100)
      : null

  const handleDelete = (id: string) => {
    if (!confirm(t.confirmDeleteTx)) return
    startTransition(async () => { await deleteSavingTransaction(id, goal.id) })
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/savings" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> {t.savingsTitle}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{goal.name}</h1>
          {!goal.is_active && <Badge variant="secondary" className="mt-1">{t.done}</Badge>}
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditGoalOpen(true)}>
          <Pencil className="mr-1 h-4 w-4" />
          Edit Goal
        </Button>
      </div>

      {/* Balance card */}
      <div className="rounded-xl border bg-card px-5 py-4 space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">{t.balance}</p>
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

      {/* Add transaction button */}
      <div className="flex justify-end">
        <Drawer open={addOpen} onOpenChange={setAddOpen}>
          <DrawerTrigger asChild>
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-1" />
              Tambah Mutasi
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Tambah Mutasi — {goal.name}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6">
              <TxForm goalId={goal.id} onSuccess={() => setAddOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Edit dialog */}
      <Dialog open={editGoalOpen} onOpenChange={setEditGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <GoalForm goal={goal} onSuccess={() => setEditGoalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTx} onOpenChange={(open) => !open && setEditTx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mutasi</DialogTitle>
          </DialogHeader>
          {editTx && (
            <TxForm
              goalId={goal.id}
              editTx={editTx}
              onSuccess={() => setEditTx(null)}
            />
          )}
        </DialogContent>
      </Dialog>

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
                    <p className="text-sm font-medium">
                      {tx.note ?? (tx.type === 'in' ? t.deposit : t.withdraw)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${tx.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'in' ? '+' : '-'}{formatIDR(Number(tx.amount))}
                  </span>
                  <div className="flex gap-1">
                    {/* Edit */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setEditTx(tx)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {/* Delete */}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
