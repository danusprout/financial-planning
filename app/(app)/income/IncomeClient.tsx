'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { IncomeForm } from '@/components/forms/IncomeForm'
import { deleteIncome } from '@/app/actions/income'
import { formatIDR, formatMonth } from '@/lib/format'
import { PlusIcon, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

type Income = {
  id: string
  month: string
  source: string
  amount: number
  note: string | null
}

interface IncomeClientProps {
  incomes: Income[]
  total: number
  activeMonth: string  // YYYY-MM
}

function prevMonth(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function IncomeClient({ incomes, total, activeMonth }: IncomeClientProps) {
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Income | null>(null)
  const [isPending, startTransition] = useTransition()

  const navigate = (month: string) => router.push(`/income?month=${month}`)

  const handleDelete = (id: string) => {
    if (!confirm('Hapus pemasukan ini?')) return
    startTransition(async () => { await deleteIncome(id) })
  }

  const displayMonth = formatMonth(new Date(`${activeMonth}-01`))

  return (
    <div className="space-y-4">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(prevMonth(activeMonth))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-semibold">{displayMonth}</span>
        <Button variant="ghost" size="icon" onClick={() => navigate(nextMonth(activeMonth))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Total card */}
      <div className="rounded-xl border bg-card px-5 py-4">
        <p className="text-sm text-muted-foreground">Total Pemasukan</p>
        <p className="text-2xl font-bold mt-1">{formatIDR(total)}</p>
      </div>

      {/* Add button */}
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <PlusIcon className="w-4 h-4 mr-1" />
            Tambah
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pemasukan</DialogTitle>
            </DialogHeader>
            <IncomeForm
              defaultMonth={activeMonth}
              onSuccess={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {incomes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Belum ada pemasukan bulan ini
        </div>
      ) : (
        <div className="space-y-2">
          {incomes.map((income) => (
            <div
              key={income.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{income.source}</p>
                {income.note && (
                  <p className="text-xs text-muted-foreground truncate">{income.note}</p>
                )}
              </div>
              <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                <span className="font-semibold text-sm">{formatIDR(Number(income.amount))}</span>
                <div className="flex gap-1">
                  <Dialog
                    open={editTarget?.id === income.id}
                    onOpenChange={(open) => !open && setEditTarget(null)}
                  >
                    <DialogTrigger
                      render={<Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditTarget(income)} />}
                    >
                      <Pencil className="w-4 h-4" />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Pemasukan</DialogTitle>
                      </DialogHeader>
                      <IncomeForm
                        editId={income.id}
                        defaultValues={{
                          month: income.month.slice(0, 7),
                          source: income.source,
                          amount: Number(income.amount),
                          note: income.note ?? undefined,
                        }}
                        onSuccess={() => setEditTarget(null)}
                      />
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(income.id)}
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
  )
}
