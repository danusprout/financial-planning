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
import { createInstallmentPayment, deleteInstallmentPayment } from '@/app/actions/installments'
import { formatIDR, formatDate } from '@/lib/format'
import { PlusIcon, Trash2, ArrowLeft, CheckCircle2, Circle } from 'lucide-react'

type Schedule = {
  id: string
  due_date: string
  expected_amount: number
  isPaid: boolean
}

type Payment = {
  id: string
  paid_date: string
  amount: number
  note: string | null
  schedule_id: string | null
}

type State = { error?: string; success?: boolean } | undefined

interface Props {
  installment: {
    id: string
    name: string
    total_amount: number
    monthly_amount: number
    tenor: number | null
    start_date: string
    is_active: boolean
    banks: { id: string; name: string } | null
  }
  schedules: Schedule[]
  payments: Payment[]
  totalPaid: number
  remaining: number
  progressPct: number
  nextUnpaidSchedule: Schedule | null
}

function PaymentForm({
  installmentId,
  schedules,
  suggestedSchedule,
  suggestedAmount,
  onSuccess,
}: {
  installmentId: string
  schedules: Schedule[]
  suggestedSchedule: Schedule | null
  suggestedAmount: number
  onSuccess: () => void
}) {
  const action = (state: State, fd: FormData) => createInstallmentPayment(installmentId, fd)
  const [state, formAction, isPending] = useActionState<State, FormData>(action, undefined)
  if (state?.success) onSuccess()

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="pay-date">Tanggal Bayar</Label>
        <Input id="pay-date" name="paid_date" type="date" defaultValue={today} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pay-amount">Nominal (Rp)</Label>
        <Input
          id="pay-amount"
          name="amount"
          type="number"
          min="0"
          step="10000"
          defaultValue={suggestedAmount}
          required
        />
      </div>

      {schedules.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="pay-schedule">Link ke Jadwal (opsional)</Label>
          <Select name="schedule_id" defaultValue={suggestedSchedule?.id ?? ''}>
            <SelectTrigger id="pay-schedule"><SelectValue placeholder="Pilih jadwal" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">— Tidak terhubung ke jadwal —</SelectItem>
              {schedules.filter((s) => !s.isPaid).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {formatDate(s.due_date)} · {formatIDR(s.expected_amount)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {suggestedSchedule && (
            <p className="text-xs text-muted-foreground">
              💡 Auto-suggest: jatuh tempo {formatDate(suggestedSchedule.due_date)}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="pay-note">Catatan (opsional)</Label>
        <Input id="pay-note" name="note" placeholder="cth: via transfer BCA" />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Menyimpan...' : 'Catat Pembayaran'}
      </Button>
    </form>
  )
}

export function InstallmentDetailClient({
  installment,
  schedules,
  payments,
  totalPaid,
  remaining,
  progressPct,
  nextUnpaidSchedule,
}: Props) {
  const [payOpen, setPayOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<'schedule' | 'history'>('history')

  const status = remaining <= 0 ? 'LUNAS' : 'BELUM LUNAS'

  const handleDeletePayment = (id: string) => {
    if (!confirm('Hapus pembayaran ini?')) return
    startTransition(async () => { await deleteInstallmentPayment(id, installment.id) })
  }

  return (
    <div className="space-y-6">
      <Link href="/app/installments" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Semua Cicilan
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{installment.name}</h1>
        <Badge variant={status === 'LUNAS' ? 'default' : 'destructive'}>{status}</Badge>
      </div>

      {installment.banks && (
        <p className="text-sm text-muted-foreground">Via {installment.banks.name}</p>
      )}

      {/* Summary card */}
      <div className="rounded-xl border bg-card px-5 py-4 space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Hutang Awal</p>
            <p className="font-bold text-sm">{formatIDR(installment.total_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sudah Dibayar</p>
            <p className="font-bold text-sm text-green-600">{formatIDR(totalPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sisa</p>
            <p className="font-bold text-sm text-red-600">{formatIDR(remaining)}</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progressPct.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Cicilan/bulan: {formatIDR(installment.monthly_amount)}</span>
          {installment.tenor && <span>Tenor: {installment.tenor} bulan</span>}
        </div>
      </div>

      {/* Add payment */}
      <div className="flex justify-end">
        <Drawer open={payOpen} onOpenChange={setPayOpen}>
          <DrawerTrigger asChild>
            <Button size="sm" disabled={status === 'LUNAS'}>
              <PlusIcon className="w-4 h-4 mr-1" />Tambah Pembayaran
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader><DrawerTitle>Catat Pembayaran — {installment.name}</DrawerTitle></DrawerHeader>
            <div className="px-4 pb-6">
              <PaymentForm
                installmentId={installment.id}
                schedules={schedules}
                suggestedSchedule={nextUnpaidSchedule}
                suggestedAmount={installment.monthly_amount}
                onSuccess={() => setPayOpen(false)}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Tabs: Jadwal | History */}
      {schedules.length > 0 && (
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(['history', 'schedule'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                tab === t ? 'bg-background shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {t === 'history' ? 'Riwayat Pembayaran' : 'Jadwal'}
            </button>
          ))}
        </div>
      )}

      {/* Schedule tab */}
      {tab === 'schedule' && schedules.length > 0 && (
        <div className="space-y-2">
          {schedules.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-3">
                {s.isPaid
                  ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  : <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                }
                <div>
                  <p className="text-sm font-medium">{formatDate(s.due_date)}</p>
                  <p className="text-xs text-muted-foreground">{s.isPaid ? 'Sudah dibayar' : 'Belum dibayar'}</p>
                </div>
              </div>
              <span className="font-semibold text-sm">{formatIDR(s.expected_amount)}</span>
            </div>
          ))}
        </div>
      )}

      {/* History tab */}
      {(tab === 'history' || schedules.length === 0) && (
        <div>
          <h2 className="font-semibold mb-3">Riwayat Pembayaran</h2>
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Belum ada pembayaran</p>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{p.note ?? 'Pembayaran'}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(p.paid_date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-green-600">{formatIDR(p.amount)}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeletePayment(p.id)}
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
      )}
    </div>
  )
}
