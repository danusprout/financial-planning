import * as React from 'react'
import { formatIDR, formatDate } from '@/lib/format'

export interface InstallmentReminderItem {
  installmentName: string
  dueDate: string
  expectedAmount: number
}

export interface InstallmentReminderProps {
  userName: string
  items: InstallmentReminderItem[]
  appUrl: string
}

export function InstallmentReminder({ userName, items, appUrl }: InstallmentReminderProps) {
  const total = items.reduce((sum, item) => sum + item.expectedAmount, 0)

  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Pengingat Cicilan Jatuh Tempo</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f9fafb', fontFamily: 'Arial, sans-serif' }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#f9fafb', padding: '32px 16px' }}>
          <tr>
            <td align="center">
              <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '560px', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {/* Header */}
                <tr>
                  <td style={{ backgroundColor: '#0f172a', padding: '24px 32px' }}>
                    <p style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 'bold' }}>
                      💰 Financial Planning
                    </p>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: '32px' }}>
                    <p style={{ margin: '0 0 16px', fontSize: '16px', color: '#111827' }}>
                      Halo, <strong>{userName}</strong>!
                    </p>
                    <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280' }}>
                      Berikut cicilan yang akan jatuh tempo dalam <strong>3 hari ke depan</strong>:
                    </p>

                    {/* Table */}
                    <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                          <th style={{ padding: '10px 12px', textAlign: 'left', color: '#374151', fontWeight: '600' }}>Cicilan</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', color: '#374151', fontWeight: '600' }}>Jatuh Tempo</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right', color: '#374151', fontWeight: '600' }}>Jumlah</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '10px 12px', color: '#111827' }}>{item.installmentName}</td>
                            <td style={{ padding: '10px 12px', color: '#374151' }}>{formatDate(item.dueDate)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#111827', fontWeight: '600' }}>
                              {formatIDR(item.expectedAmount)}
                            </td>
                          </tr>
                        ))}
                        <tr style={{ backgroundColor: '#fef9c3' }}>
                          <td colSpan={2} style={{ padding: '10px 12px', color: '#374151', fontWeight: '600' }}>Total</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: '#111827', fontWeight: '700' }}>
                            {formatIDR(total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* CTA */}
                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                      <a
                        href={`${appUrl}/app/installments`}
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          padding: '12px 24px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                        }}
                      >
                        Lihat Detail Cicilan →
                      </a>
                    </div>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ backgroundColor: '#f9fafb', padding: '20px 32px', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
                      Email ini dikirim otomatis oleh Financial Planning. Jangan balas email ini.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}

export default InstallmentReminder
