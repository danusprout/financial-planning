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
import { CategoryForm } from '@/components/forms/CategoryForm'
import { deleteCategory } from '@/app/actions/settings'
import { PlusIcon, Pencil, Trash2 } from 'lucide-react'

type Category = {
  id: string
  user_id: string | null
  name: string
  group: string
  color: string | null
}

interface CategoriesClientProps {
  categories: Category[]
  userId: string
}

const GROUP_LABELS: Record<string, string> = {
  needs: 'Kebutuhan (Needs)',
  wants: 'Keinginan (Wants)',
  obligations: 'Kewajiban (Obligations)',
}

const GROUPS = ['needs', 'wants', 'obligations'] as const

export function CategoriesClient({ categories, userId }: CategoriesClientProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    if (!confirm('Hapus kategori ini?')) return
    startTransition(async () => {
      await deleteCategory(id)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <PlusIcon className="w-4 h-4 mr-1" />
            Tambah Kategori
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori Kustom</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {GROUPS.map((group) => {
        const items = categories.filter((c) => c.group === group)
        if (items.length === 0) return null

        return (
          <div key={group}>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              {GROUP_LABELS[group]}
            </h3>
            <div className="space-y-2">
              {items.map((cat) => {
                const isOwn = cat.user_id === userId

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {cat.color && (
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                      )}
                      <span className="text-sm font-medium">{cat.name}</span>
                      {!isOwn && (
                        <Badge variant="secondary" className="text-xs">
                          Publik
                        </Badge>
                      )}
                    </div>

                    {isOwn && (
                      <div className="flex gap-2">
                        <Dialog
                          open={editTarget?.id === cat.id}
                          onOpenChange={(open) => !open && setEditTarget(null)}
                        >
                          <DialogTrigger
                            render={<Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditTarget(cat)} />}
                          >
                            <Pencil className="w-4 h-4" />
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Kategori</DialogTitle>
                            </DialogHeader>
                            <CategoryForm
                              editId={cat.id}
                              defaultValues={{
                                name: cat.name,
                                group: cat.group as 'needs' | 'wants' | 'obligations',
                                color: cat.color ?? undefined,
                              }}
                              onSuccess={() => setEditTarget(null)}
                            />
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(cat.id)}
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
