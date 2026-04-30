import { renderToStaticMarkup } from 'react-dom/server'
import * as React from 'react'
import { InstallmentReminder, type InstallmentReminderProps } from '@/emails/InstallmentReminder'

export function renderInstallmentReminder(props: InstallmentReminderProps): string {
  return renderToStaticMarkup(React.createElement(InstallmentReminder, props))
}
