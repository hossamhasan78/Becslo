const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

const htmlEscapeRegex = /[&<>"'\/]/g

export function escapeHtml(str: string): string {
  return str.replace(htmlEscapeRegex, (char) => htmlEscapes[char] || char)
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return escapeHtml(input.trim())
}

export function sanitizeNumber(value: unknown, options: { min?: number; max?: number } = {}): number {
  const num = Number(value)
  
  if (isNaN(num)) return 0
  
  const { min, max } = options
  if (min !== undefined && num < min) return min
  if (max !== undefined && num > max) return max
  
  return num
}

export function sanitizeEmail(email: string): string {
  const sanitized = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  return emailRegex.test(sanitized) ? sanitized : ''
}

export function truncateText(text: string, maxLength: number): string {
  if (typeof text !== 'string') return ''
  if (text.length <= maxLength) return text
  
  return text.slice(0, maxLength - 3) + '...'
}

export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function safeCalculate(hours: number, rate: number): number {
  const maxHours = 10000
  const maxRate = 10000
  
  const safeHours = clampValue(hours, 0, maxHours)
  const safeRate = clampValue(rate, 0, maxRate)
  
  const result = safeHours * safeRate
  
  if (!isFinite(result) || isNaN(result)) {
    return 0
  }
  
  return Math.round(result)
}
