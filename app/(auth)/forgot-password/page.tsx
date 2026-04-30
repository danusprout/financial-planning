'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { forgotPassword } from '@/app/actions/auth'

type State = { error?: string; success?: boolean } | undefined

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    forgotPassword,
    undefined
  )

  if (state?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Terkirim ✉️</CardTitle>
          <CardDescription>Cek inbox kamu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Link reset password sudah dikirim. Cek folder spam jika tidak ada di inbox.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Kembali ke halaman masuk</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lupa Password</CardTitle>
        <CardDescription>Masukkan email untuk menerima link reset password</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="kamu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Mengirim...' : 'Kirim Link Reset'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="underline underline-offset-4">
            Kembali ke halaman masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
