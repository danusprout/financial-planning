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

const ALL_FILTER_VALUE = '__all__'

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
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
            Expense Tracker
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {t.expensesTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{t.expensesSubtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:w-auto">
          <div className="rounded-[1.5rem] border border-slate-200 bg-stone-50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{t.totalExpenses}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {formatIDR(total)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-stone-50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Periode</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {activeMonth.split('-')[1]}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-[1.75rem] border border-slate-200 bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-slate-300 bg-white hover:bg-slate-100"
              onClick={() => navigate(prevMonth(activeMonth))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Bulan aktif</p>
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                {formatMonth(new Date(`${activeMonth}-01`))}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-slate-300 bg-white hover:bg-slate-100"
            onClick={() => navigate(nextMonth(activeMonth))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <SlidersHorizontal className="h-4 w-4 flex-shrink-0" />
              <span>Filter</span>
            </div>
            <div className="grid flex-1 gap-3 md:grid-cols-2">
              <Select
                value={filterCategory ?? ALL_FILTER_VALUE}
                onValueChange={(v) => {
                  const nextCategory = !v || v === ALL_FILTER_VALUE ? undefined : v
                  router.push(buildUrl({ category: nextCategory, bank: filterBank ?? undefined }))
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm">
                  <span className={filterCategory ? 'text-slate-900' : 'text-slate-500'}>
                    {filterCategory
                      ? (categories.find((c) => c.id === filterCategory)?.name ?? t.allCategories)
                      : t.allCategories}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>{t.allCategories}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterBank ?? ALL_FILTER_VALUE}
                onValueChange={(v) => {
                  const nextBank = !v || v === ALL_FILTER_VALUE ? undefined : v
                  router.push(buildUrl({ bank: nextBank, category: filterCategory ?? undefined }))
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-2xl border-slate-200 bg-stone-50 px-4 text-sm">
                  <span className={filterBank ? 'text-slate-900' : 'text-slate-500'}>
                    {filterBank
                      ? (banks.find((b) => b.id === filterBank)?.name ?? t.allPaymentSources)
                      : t.allPaymentSources}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>{t.allPaymentSources}</SelectItem>
                  {banks.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Drawer open={addOpen} onOpenChange={setAddOpen}>
            <DrawerTrigger asChild>
              <Button
                className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800"
                size="lg"
              >
                <PlusIcon className="mr-1 h-4 w-4" />
                {t.addExpense}
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

        {sortedDates.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-stone-50 px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-900">{t.noExpenses}</p>
            <p className="mt-2 text-sm text-slate-500">
              Tambahkan pengeluaran pertama untuk mulai melihat riwayat bulan ini.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const dayExpenses = byDate[date]
              const dayTotal = dayExpenses.reduce((s, e) => s + Number(e.amount), 0)

              return (
                <div key={date} className="rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">
                      {formatDate(date)}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">{formatIDR(dayTotal)}</span>
                  </div>

                  <div className="space-y-3">
                    {dayExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-stone-50 px-4 py-4"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-medium text-slate-900">
                              {expense.description}
                            </span>
                            {expense.status !== 'paid' && (
                              <Badge className={`text-xs px-1.5 ${STATUS_BADGE[expense.status]}`} variant="outline">
                                {STATUS_LABEL[expense.status]}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1.5 flex gap-2">
                            {expense.expense_categories && (
                              <span className="text-xs text-slate-500">
                                {expense.expense_categories.name}
                              </span>
                            )}
                            {expense.banks && (
                              <span className="text-xs text-slate-500">
                                · {expense.banks.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {formatIDR(Number(expense.amount))}
                          </span>
                          <div className="flex gap-1">
                            <Dialog
                              open={editTarget?.id === expense.id}
                              onOpenChange={(open) => !open && setEditTarget(null)}
                            >
                              <DialogTrigger
                                render={<Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-white" onClick={() => setEditTarget(expense)} />}
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
                              className="h-8 w-8 rounded-full text-destructive hover:bg-white hover:text-destructive"
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
