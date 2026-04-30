'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { BankForm } from '@/components/forms/BankForm'
import { deleteBank } from '@/app/actions/settings'
import { PlusIcon, Pencil, Trash2 } from 'lucide-react'

type Bank = {
  id: string
  user_id: string | null
  name: string
  type: string
  color: string | null
}

interface BanksClientProps {
  banks: Bank[]
  userId: string
}

const TYPE_LABELS: Record<string, string> = {
  bank: 'Bank',
  ewallet: 'E-Wallet',
  cash: 'Tunai',
  credit: 'Kartu Kredit',
}

const TYPES = ['bank', 'ewallet', 'cash', 'credit'] as const

export function BanksClient({ banks, userId }: BanksClientProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Bank | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    if (!confirm('Hapus sumber dana ini?')) return
    startTransition(async () => {
      await deleteBank(id)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-1" />
              Tambah Bank / Sumber Dana
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Sumber Dana Kustom</DialogTitle>
            </DialogHeader>
            <BankForm onSuccess={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {TYPES.map((type) => {
        const items = banks.filter((b) => b.type === type)
        if (items.length === 0) return null

        return (
          <div key={type}>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              {TYPE_LABELS[type]}
            </h3>
            <div className="space-y-2">
              {items.map((bank) => {
                const isOwn = bank.user_id === userId

                return (
                  <div
                    key={bank.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {bank.color && (
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: bank.color }}
                        />
                      )}
                      <span className="text-sm font-medium">{bank.name}</span>
                      {!isOwn && (
                        <Badge variant="secondary" className="text-xs">
                          Publik
                        </Badge>
                      )}
                    </div>

                    {isOwn && (
                      <div className="flex gap-2">
                        <Dialog
                          open={editTarget?.id === bank.id}
                          onOpenChange={(open) => !open && setEditTarget(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => setEditTarget(bank)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Sumber Dana</DialogTitle>
                            </DialogHeader>
                            <BankForm
                              editId={bank.id}
                              defaultValues={{
                                name: bank.name,
                                type: bank.type as 'bank' | 'ewallet' | 'cash' | 'credit',
                                color: bank.color ?? undefined,
                              }}
                              onSuccess={() => setEditTarget(null)}
                            />
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(bank.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
