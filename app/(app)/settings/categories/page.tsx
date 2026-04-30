import { createClient } from '@/lib/supabase/server'
import { CategoriesClient } from './CategoriesClient'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all: public (user_id IS NULL) + own custom
  const { data: categories } = await supabase
    .from('expense_categories')
    .select('*')
    .order('group')
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kategori Pengeluaran</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preset publik tersedia untuk semua user. Kamu bisa tambah kategori kustom sendiri.
        </p>
      </div>
      <CategoriesClient categories={categories ?? []} userId={user?.id ?? ''} />
    </div>
  )
}
