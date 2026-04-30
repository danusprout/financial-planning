import { render } from '@react-email/render'
import * as React from 'react'
import { InstallmentReminder, type InstallmentReminderProps } from '@/emails/InstallmentReminder'

export async function renderInstallmentReminder(props: InstallmentReminderProps): Promise<string> {
  return await render(React.createElement(InstallmentReminder, props))
}
