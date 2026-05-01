'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createGoal } from '@/app/actions/savings'
import { formatIDR, formatDate } from '@/lib/format'
import { useLang } from '@/lib/i18n'
import { PlusIcon, ChevronRight } from 'lucide-react'
import { useActionState } from 'react'

type Goal = {
  id: string
  name: string
  target_amount: number | null
  target_date: string | null
  is_active: boolean
  balance: number
}

type State = { error?: string; success?: boolean } | undefined

function GoalForm({ onSuccess }: { onSuccess: () => void }) {
  const wrappedAction = (_: State, formData: FormData) => createGoal(formData)
  const [state, formAction, isPending] = useActionState<State, FormData>(wrappedAction, undefined)
  const { t } = useLang()
  if (state?.success) onSuccess()

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="goal-name">{t.goalName}</Label>
        <Input id="goal-name" name="name" placeholder="cth: Dana Darurat, Tabungan iPad" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal-target">{t.targetAmount}</Label>
        <Input id="goal-target" name="target_amount" type="number" min="0" step="100000" placeholder="0" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal-date">{t.targetDate}</Label>
        <Input id="goal-date" name="target_date" type="date" />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t.savingLabel : t.addGoal}
      </Button>
    </form>
  )
}

export function SavingsListClient({ goals }: { goals: Goal[] }) {
  const [addOpen, setAddOpen] = useState(false)
  const { t } = useLang()

  const active = goals.filter((g) => g.is_active)
  const inactive = goals.filter((g) => !g.is_active)
  const totalBalance = active.reduce((s, g) => s + g.balance, 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl border bg-card px-5 py-4">
        <p className="text-sm text-muted-foreground">{t.totalBalance}</p>
        <p className="text-2xl font-bold mt-1">{formatIDR(totalBalance)}</p>
      </div>

      {/* Add */}
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <PlusIcon className="w-4 h-4 mr-1" />{t.addGoal}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t.addGoal}</DialogTitle></DialogHeader>
            <GoalForm onSuccess={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Active goals */}
      {active.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {t.noGoals}
        </div>
      ) : (
        <div className="space-y-2">
          {active.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
        </div>
      )}

      {/* Inactive goals */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Tidak Aktif</p>
          <div className="space-y-2 opacity-60">
            {inactive.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function GoalCard({ goal }: { goal: Goal }) {
  const { t } = useLang()
  const progress =
    goal.target_amount && goal.target_amount > 0
      ? Math.min((goal.balance / goal.target_amount) * 100, 100)
      : null

  return (
    <Link
      href={`/savings/${goal.id}`}
      className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{goal.name}</span>
          {!goal.is_active && <Badge variant="secondary" className="text-xs">{t.done}</Badge>}
        </div>
        <p className="text-sm font-semibold mt-0.5">{formatIDR(goal.balance)}</p>
        {goal.target_amount && (
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {progress?.toFixed(0)}% dari {formatIDR(goal.target_amount)}
              {goal.target_date && ` · ${formatDate(goal.target_date)}`}
            </p>
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />
    </Link>
  )
}
