'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExpenseForm } from '@/components/forms/ExpenseForm'
import { deleteExpense } from '@/app/actions/expenses'
import { formatIDR, formatDate, formatMonth } from '@/lib/format'
import { useLang } from '@/lib/i18n'
import { PlusIcon, Pencil, Trash2, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'

type Category = { id: string; name: string; group: string; color: string | null }
type Bank = { id: string; name: string; type: string }
type Expense = {
  id: string
  date: string
  amount: number
  description: string
  status: 'planned' | 'paid' | 'pending'
  category_id: string | null
  bank_id: string | null
  expense_categories: Category | null
  banks: Bank | null
}

interface ExpensesClientProps {
  expenses: Expense[]
  categories: Category[]
  banks: Bank[]
  total: number
  activeMonth: string
  filterCategory?: string
  filterBank?: string
}

function prevMonth(yyyyMM: string) {
  const [y, m] = yyyyMM.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function nextMonth(yyyyMM: string) {
  const [y, m] = yyyyMM.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const STATUS_BADGE: Record<string, string> = {
  paid: '',
  pending: 'bg-yellow-100 text-yellow-800',
  planned: 'bg-blue-100 text-blue-800',
}

export function ExpensesClient({
  expenses,
  categories,
  banks,
  total,
  activeMonth,
  filterCategory,
  filterBank,
}: ExpensesClientProps) {
  const router = useRouter()
  const { t } = useLang()
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Expense | null>(null)
  const [isPending, startTransition] = useTransition()

  const STATUS_LABEL: Record<string, string> = {
    paid: t.statusPaid,
    pending: t.statusPending,
    planned: t.statusPlanned,
  }

  const today = new Date().toISOString().slice(0, 10)

  const buildUrl = (params: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    p.set('month', activeMonth)
    if (params.category) p.set('category', params.category)
    if (params.bank) p.set('bank', params.bank)
    return `/expenses?${p.toString()}`
  }

  const navigate = (month: string) =>
    router.push(buildUrl({ category: filterCategory, bank: filterBank, month }))

  const handleDelete = (id: string) => {
    if (!confirm(t.confirmDeleteExpense)) return
    startTransition(async () => { await deleteExpense(id) })
  }

  // Group by date
  const byDate = expenses.reduce<Record<string, Expense[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = []
    acc[e.date].push(e)
    return acc
  }, {})

  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.expensesTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.expensesSubtitle}</p>
      </div>
      <div className="space-y-4">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(prevMonth(activeMonth))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-semibold">{formatMonth(new Date(`${activeMonth}-01`))}</span>
        <Button variant="ghost" size="icon" onClick={() => navigate(nextMonth(activeMonth))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Total */}
      <div className="rounded-xl border bg-card px-5 py-4">
        <p className="text-sm text-muted-foreground">{t.totalExpenses}</p>
        <p className="text-2xl font-bold mt-1">{formatIDR(total)}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Select
          value={filterCategory ?? ''}
          onValueChange={(v) =>
            router.push(buildUrl({ category: v || undefined, bank: filterBank }))
          }
        >
          <SelectTrigger className="h-8 text-xs flex-1">
            <SelectValue placeholder={t.allCategories} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t.allCategories}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterBank ?? ''}
          onValueChange={(v) =>
            router.push(buildUrl({ bank: v || undefined, category: filterCategory }))
          }
        >
          <SelectTrigger className="h-8 text-xs flex-1">
            <SelectValue placeholder={t.allPaymentSources} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t.allPaymentSources}</SelectItem>
            {banks.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick-add (Drawer — mobile friendly) */}
      <div className="flex justify-end">
        <Drawer open={addOpen} onOpenChange={setAddOpen}>
          <DrawerTrigger asChild>
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-1" />
              {t.add}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t.addExpense}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6">
              <ExpenseForm
                categories={categories}
                banks={banks}
                defaultDate={today}
                onSuccess={() => setAddOpen(false)}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* List grouped by date */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {t.noExpenses}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const dayExpenses = byDate[date]
            const dayTotal = dayExpenses.reduce((s, e) => s + Number(e.amount), 0)

            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {formatDate(date)}
                  </span>
                  <span className="text-sm font-semibold">{formatIDR(dayTotal)}</span>
                </div>

                <div className="space-y-2">
                  {dayExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium truncate">
                            {expense.description}
                          </span>
                          {expense.status !== 'paid' && (
                            <Badge className={`text-xs px-1.5 ${STATUS_BADGE[expense.status]}`} variant="outline">
                              {STATUS_LABEL[expense.status]}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2 mt-0.5">
                          {expense.expense_categories && (
                            <span className="text-xs text-muted-foreground">
                              {expense.expense_categories.name}
                            </span>
                          )}
                          {expense.banks && (
                            <span className="text-xs text-muted-foreground">
                              · {expense.banks.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span className="font-semibold text-sm">
                          {formatIDR(Number(expense.amount))}
                        </span>
                        <div className="flex gap-1">
                          <Dialog
                            open={editTarget?.id === expense.id}
                            onOpenChange={(open) => !open && setEditTarget(null)}
                          >
                            <DialogTrigger
                              render={<Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditTarget(expense)} />}
                            >
                              <Pencil className="w-4 h-4" />
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t.editExpense}</DialogTitle>
                              </DialogHeader>
                              <ExpenseForm
                                editId={expense.id}
                                categories={categories}
                                banks={banks}
                                defaultValues={{
                                  date: expense.date,
                                  category_id: expense.category_id,
                                  bank_id: expense.bank_id,
                                  amount: Number(expense.amount),
                                  description: expense.description,
                                  status: expense.status,
                                }}
                                onSuccess={() => setEditTarget(null)}
                              />
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(expense.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      </div>
    </div>
  )
}
