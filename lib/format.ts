import { format } from 'date-fns'
import { id } from 'date-fns/locale'

/**
 * Format a number as IDR currency.
 * Example: 1234000 → "Rp1.234.000"
 */
export function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format a date as "d MMM yyyy" in Indonesian locale.
 * Example: new Date('2026-04-30') → "30 Apr 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'd MMM yyyy', { locale: id })
}

/**
 * Format a date as "MMMM yyyy" for month display.
 * Example: new Date('2026-04-01') → "April 2026"
 */
export function formatMonth(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMMM yyyy', { locale: id })
}

/**
 * Get the first day of a month in YYYY-MM-DD format.
 * Example: (2026, 4) → "2026-04-01"
 */
export function monthToDate(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}-01`
}

/**
 * Parse a YYYY-MM string into { year, month }.
 */
export function parseYearMonth(yyyyMM: string): { year: number; month: number } {
  const [year, month] = yyyyMM.split('-').map(Number)
  return { year, month }
}
