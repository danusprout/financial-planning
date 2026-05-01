'use client'

import { useState, useTransition } from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { createGoal, createSavingTransaction, deleteSavingTransaction } from '@/app/actions/savings'
import { formatIDR, formatDate } from '@/lib/format'
import { PlusIcon, Trash2, TrendingDown, TrendingUp, Target, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type Tx = {
  id: string
  date: string
  type: string
  amount: number
  note: string | null
  created_at: string
}

type Goal = {
  id: string
  name: string
  target_amount: number | null
  target_date: string | null
  is_active: boolean
  balance: number
  transactions: Tx[]
}

type State = { error?: string; success?: boolean } | undefined

// ─── Add Goal Form ────────────────────────────────────────────────────────────
function GoalForm({ onSuccess }: { onSuccess: () => void }) {
  const wrappedAction = (_: State, fd: FormData) => createGoal(fd)
  const [state, formAction, isPending] = useActionState<State, FormData>(wrappedAction, undefined)
  if (state?.success) onSuccess()
  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
      <div className="space-y-1.5">
        <Label>Goal Name</Label>
        <Input name="name" placeholder="e.g. Emergency Fund, iPad, Wedding" required />
      </div>
      <div className="space-y-1.5">
        <Label>Target Amount (optional)</Label>
        <Input name="target_amount" type="number" min="0" step="100000" placeholder="0" />
      </div>
      <div className="space-y-1.5">
        <Label>Target Date (optional)</Label>
        <Input name="target_date" type="date" />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving...' : 'Create Goal'}
      </Button>
    </form>
  )
}

// ─── Add Transaction Form ─────────────────────────────────────────────────────
function TxForm({ goal, type, onSuccess }: { goal: Goal; type: 'in' | 'out'; onSuccess: () => void }) {
  const action = (_: State, fd: FormData) => createSavingTransaction(goal.id, fd)
  const [state, formAction, isPending] = useActionState<State, FormData>(action, undefined)
  if (state?.success) onSuccess()
  const today = new Date().toISOString().slice(0, 10)
  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
      <input type="hidden" name="type" value={type} />
      <div className="space-y-1.5">
        <Label>Date</Label>
        <Input name="date" type="date" defaultValue={today} required />
      </div>
      <div className="space-y-1.5">
        <Label>Amount (Rp)</Label>
        <Input name="amount" type="number" min="1000" step="1000" placeholder="0" required />
      </div>
      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Input name="note" placeholder={type === 'in' ? 'Monthly deposit' : 'Reason for withdrawal'} />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}
        variant={type === 'out' ? 'destructive' : 'default'}>
        {isPending ? 'Saving...' : type === 'in' ? '+ Add Deposit' : '− Add Withdrawal'}
      </Button>
    </form>
  )
}

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({ goal }: { goal: Goal }) {
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const pct = goal.target_amount && goal.target_amount > 0
    ? Math.min((goal.balance / goal.target_amount) * 100, 100) : null

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{goal.name}</h3>
            {!goal.is_active && <Badge variant="secondary">Closed</Badge>}
          </div>
          <p className="text-2xl font-bold mt-1">{formatIDR(goal.balance)}</p>
          {goal.target_amount && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Target: {formatIDR(goal.target_amount)}
              {goal.target_date && ` · by ${formatDate(goal.target_date)}`}
            </p>
          )}
        </div>
        <Link href={`/savings/${goal.id}`} className="text-xs text-primary flex items-center gap-1 hover:underline mt-1">
          Detail <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {pct !== null && (
        <div className="space-y-1">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% of target</p>
        </div>
      )}

      <div className="flex gap-2">
        <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
          <DialogTrigger render={<Button size="sm" className="flex-1" />}>
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> Deposit
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Deposit to {goal.name}</DialogTitle></DialogHeader>
            <TxForm goal={goal} type="in" onSuccess={() => setDepositOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
          <DialogTrigger render={<Button size="sm" variant="outline" className="flex-1" />}>
            <TrendingDown className="w-3.5 h-3.5 mr-1" /> Withdraw
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Withdraw from {goal.name}</DialogTitle></DialogHeader>
            <TxForm goal={goal} type="out" onSuccess={() => setWithdrawOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// ─── Monthly Recap Table ──────────────────────────────────────────────────────
function MonthlyRecap({ goals }: { goals: Goal[] }) {
  // Group all 'in' transactions by YYYY-MM, then by goal_id
  const monthMap: Record<string, Record<string, number>> = {}
  const goalIds = goals.map(g => g.id)

  for (const goal of goals) {
    for (const tx of goal.transactions) {
      if (tx.type !== 'in') continue
      const month = tx.date.slice(0, 7) // YYYY-MM
      if (!monthMap[month]) monthMap[month] = {}
      monthMap[month][goal.id] = (monthMap[month][goal.id] ?? 0) + tx.amount
    }
  }

  const months = Object.keys(monthMap).sort((a, b) => b.localeCompare(a))
  if (months.length === 0) return (
    <div className="text-center py-8 text-sm text-muted-foreground">No deposits yet</div>
  )

  const monthLabel = (ym: string) => {
    const [y, m] = ym.split('-').map(Number)
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground w-32">Month</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Goal</th>
            <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Amount</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => {
            const byGoal = monthMap[month]
            const goalRows = goalIds.filter(id => byGoal[id])
            const monthTotal = Object.values(byGoal).reduce((s, v) => s + v, 0)

            return goalRows.map((goalId, i) => {
              const goal = goals.find(g => g.id === goalId)!
              return (
                <tr key={`${month}-${goalId}`} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {i === 0 ? <span className="font-medium text-foreground">{monthLabel(month)}</span> : ''}
                  </td>
                  <td className="px-4 py-2.5">{goal.name}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-green-600">{formatIDR(byGoal[goalId])}</td>
                </tr>
              )
            }).concat(
              // Total row for month
              <tr key={`${month}-total`} className="border-b bg-muted/30">
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Total {monthLabel(month)}</td>
                <td className="px-4 py-2 text-right font-bold">{formatIDR(monthTotal)}</td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="bg-primary/10 border-t-2">
            <td className="px-4 py-3"></td>
            <td className="px-4 py-3 font-bold">Grand Total (All Deposits)</td>
            <td className="px-4 py-3 text-right font-bold text-primary">
              {formatIDR(goals.reduce((s, g) => s + g.transactions.filter(t => t.type === 'in').reduce((ss, t) => ss + t.amount, 0), 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── Withdrawal Log ───────────────────────────────────────────────────────────
function WithdrawalLog({ goals }: { goals: Goal[] }) {
  const [, startTransition] = useTransition()

  const outTxs = goals.flatMap(g =>
    g.transactions
      .filter(t => t.type === 'out')
      .map(t => ({ ...t, goalName: g.name, goalId: g.id }))
  ).sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))

  if (outTxs.length === 0) return (
    <div className="text-center py-8 text-sm text-muted-foreground">No withdrawals yet</div>
  )

  const handleDelete = (id: string, goalId: string) => {
    startTransition(async () => {
      await deleteSavingTransaction(id, goalId)
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Goal</th>
            <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Amount</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Notes</th>
            <th className="py-3 px-4 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {outTxs.map((tx) => (
            <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/20">
              <td className="px-4 py-2.5 text-muted-foreground">{formatDate(tx.date)}</td>
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  {tx.goalName}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right font-semibold text-rose-600">{formatIDR(tx.amount)}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{tx.note ?? '—'}</td>
              <td className="px-4 py-2.5">
                <button
                  onClick={() => handleDelete(tx.id, tx.goalId)}
                  className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-rose-50 dark:bg-rose-950/20 border-t-2">
            <td className="px-4 py-3" colSpan={2}><span className="font-bold">Total Withdrawals</span></td>
            <td className="px-4 py-3 text-right font-bold text-rose-600">
              {formatIDR(outTxs.reduce((s, t) => s + t.amount, 0))}
            </td>
            <td colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SavingsClient({ goals }: { goals: Goal[] }) {
  const [addOpen, setAddOpen] = useState(false)
  const [tab, setTab] = useState<'goals' | 'monthly' | 'withdrawals'>('goals')

  const activeGoals = goals.filter(g => g.is_active)
  const totalBalance = activeGoals.reduce((s, g) => s + g.balance, 0)
  const totalTarget = activeGoals.filter(g => g.target_amount).reduce((s, g) => s + (g.target_amount ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Balance</p>
          <p className="text-2xl font-bold mt-1 text-primary">{formatIDR(totalBalance)}</p>
        </div>
        {totalTarget > 0 && (
          <div className="rounded-xl border bg-card px-5 py-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Target</p>
            <p className="text-2xl font-bold mt-1">{formatIDR(totalTarget)}</p>
          </div>
        )}
        <div className="rounded-xl border bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Goals</p>
          <p className="text-2xl font-bold mt-1">{activeGoals.length}</p>
        </div>
      </div>

      {/* Tabs + Add button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 border rounded-lg p-1 bg-muted/30">
          {(['goals', 'monthly', 'withdrawals'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'goals' ? '🎯 Goals' : t === 'monthly' ? '📅 Monthly' : '📤 Withdrawals'}
            </button>
          ))}
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <PlusIcon className="w-4 h-4 mr-1" /> Add Goal
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Saving Goal</DialogTitle></DialogHeader>
            <GoalForm onSuccess={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tab content */}
      {tab === 'goals' && (
        <div>
          {goals.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No saving goals yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map(g => <GoalCard key={g.id} goal={g} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'monthly' && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/30">
            <h2 className="font-semibold">Monthly Deposit Recap</h2>
            <p className="text-xs text-muted-foreground mt-0.5">All deposits grouped by month and goal</p>
          </div>
          <MonthlyRecap goals={goals} />
        </div>
      )}

      {tab === 'withdrawals' && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/30">
            <h2 className="font-semibold">Withdrawal Log</h2>
            <p className="text-xs text-muted-foreground mt-0.5">All withdrawals from saving goals</p>
          </div>
          <WithdrawalLog goals={goals} />
        </div>
      )}
    </div>
  )
}
