'use client'

import { useActionState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { resetPassword } from '@/app/actions/auth'

type State = { error?: string } | undefined

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState<State, FormData>(resetPassword, undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Password Baru</CardTitle>
        <CardDescription>Masukkan password baru kamu</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Min. 8 karakter"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan Password Baru'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
