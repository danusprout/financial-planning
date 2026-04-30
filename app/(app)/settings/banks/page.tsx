import { createClient } from '@/lib/supabase/server'
import { BanksClient } from './BanksClient'

export default async function BanksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: banks } = await supabase
    .from('banks')
    .select('*')
    .order('type')
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bank & Sumber Dana</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preset publik tersedia untuk semua user. Kamu bisa tambah sumber dana kustom sendiri.
        </p>
      </div>
      <BanksClient banks={banks ?? []} userId={user?.id ?? ''} />
    </div>
  )
}
