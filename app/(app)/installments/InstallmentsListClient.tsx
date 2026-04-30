'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { createInstallment } from '@/app/actions/installments'
import { formatIDR } from '@/lib/format'
import { PlusIcon, ChevronRight } from 'lucide-react'

type Bank = { id: string; name: string; type: string }
type InstallmentRow = {
  id: string
  name: string
  total_amount: number
  monthly_amount: number
  tenor: number | null
  start_date: string
  is_active: boolean
  bank: { id: string; name: string } | null
  totalPaid: number
  remaining: number
  progressPct: number
  status: 'LUNAS' | 'BELUM LUNAS'
}

type State = { error?: string; success?: boolean } | undefined

function InstallmentForm({ banks, onSuccess }: { banks: Bank[]; onSuccess: () => void }) {
  const [state, formAction, isPending] = useActionState<State, FormData>(createInstallment, undefined)
  if (state?.success) onSuccess()

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="inst-name">Nama Pinjaman</Label>
        <Input id="inst-name" name="name" placeholder="cth: KPR, Cicilan HP" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="inst-total">Hutang Awal (Rp)</Label>
          <Input id="inst-total" name="total_amount" type="number" min="0" step="100000" placeholder="0" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inst-monthly">Cicilan/Bulan (Rp)</Label>
          <Input id="inst-monthly" name="monthly_amount" type="number" min="0" step="10000" placeholder="0" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="inst-tenor">Tenor (bulan, opsional)</Label>
          <Input id="inst-tenor" name="tenor" type="number" min="1" placeholder="cth: 12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inst-start">Tanggal Mulai</Label>
          <Input id="inst-start" name="start_date" type="date" defaultValue={today} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="inst-bank">Sumber Dana (opsional)</Label>
        <Select name="bank_id" defaultValue="">
          <SelectTrigger id="inst-bank"><SelectValue placeholder="Pilih bank" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">— Tidak ada —</SelectItem>
            {banks.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Menyimpan...' : 'Tambah Pinjaman'}
      </Button>
    </form>
  )
}

export function InstallmentsListClient({ rows, banks }: { rows: InstallmentRow[]; banks: Bank[] }) {
  const [addOpen, setAddOpen] = useState(false)

  const active = rows.filter((r) => r.status !== 'LUNAS' && r.is_active)
  const lunas = rows.filter((r) => r.status === 'LUNAS' || !r.is_active)
  const totalRemaining = active.reduce((s, r) => s + r.remaining, 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl border bg-card px-5 py-4">
        <p className="text-sm text-muted-foreground">Total Sisa Hutang Aktif</p>
        <p className="text-2xl font-bold mt-1">{formatIDR(totalRemaining)}</p>
      </div>

      {/* Add */}
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><PlusIcon className="w-4 h-4 mr-1" />Tambah Pinjaman</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Pinjaman</DialogTitle></DialogHeader>
            <InstallmentForm banks={banks} onSuccess={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table mirip Google Sheet */}
      {rows.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Belum ada pinjaman</div>
      ) : (
        <div className="space-y-2">
          {active.map((row) => <InstallmentRow key={row.id} row={row} />)}
          {lunas.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 mt-4">Lunas / Tidak Aktif</p>
              <div className="space-y-2 opacity-60">
                {lunas.map((row) => <InstallmentRow key={row.id} row={row} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InstallmentRow({ row }: { row: InstallmentRow }) {
  return (
    <Link
      href={`/app/installments/${row.id}`}
      className="block rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{row.name}</span>
          {row.bank && <span className="text-xs text-muted-foreground">· {row.bank.name}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={row.status === 'LUNAS' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {row.status}
          </Badge>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div>
          <p className="text-muted-foreground">Hutang Awal</p>
          <p className="font-semibold">{formatIDR(row.total_amount)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Sudah Dibayar</p>
          <p className="font-semibold text-green-600">{formatIDR(row.totalPaid)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Sisa</p>
          <p className="font-semibold text-red-600">{formatIDR(row.remaining)}</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>% Lunas</span>
          <span>{row.progressPct.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${row.progressPct}%` }}
          />
        </div>
      </div>
    </Link>
  )
}
