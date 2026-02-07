import { format as dateFnsFormat } from 'date-fns'

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: EUR)
 * @param locale - The locale to use (default: fr-FR)
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format a date
 * @param date - The date to format
 * @param formatStr - The format string (default: PPP)
 */
export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateFnsFormat(dateObj, formatStr)
}

/**
 * Format a percentage
 * @param value - The value to format
 * @param decimals - Number of decimal places (default: 2)
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format a number with thousands separators
 * @param value - The value to format
 * @param locale - The locale to use (default: fr-FR)
 */
export function formatNumber(value: number, locale: string = 'fr-FR'): string {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Format a relative time (e.g., "2 days ago", "in 3 hours")
 * @param date - The date to format
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })

  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(-diffInSeconds, 'second')
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(-diffInMinutes, 'minute')
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(-diffInHours, 'hour')
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(-diffInDays, 'day')
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(-diffInMonths, 'month')
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return rtf.format(-diffInYears, 'year')
}
