import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cek Email Kamu 📬</CardTitle>
        <CardDescription>Kami sudah kirim link verifikasi ke email kamu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Buka email dan klik link verifikasi untuk mengaktifkan akun. Setelah diverifikasi, kamu
          bisa langsung masuk.
        </p>
        <p className="text-sm text-muted-foreground">
          Tidak dapat email? Cek folder <strong>spam</strong> atau coba daftar ulang dengan email
          yang sama.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Kembali ke halaman masuk</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
