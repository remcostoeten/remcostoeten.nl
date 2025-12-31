export type DateParts = {
  day: number
  month: string
  year: number
}

export function parseDate(input: string): Date {
  const value = input?.trim()
  if (!value) {
    return new Date()
  }

  const directDate = new Date(value)
  if (!Number.isNaN(directDate.getTime())) {
    return directDate
  }

  const cleanValue = value.replace(/\s+/g, '')
  const separator = cleanValue.includes('-') ? '-' : cleanValue.includes('/') ? '/' : null
  if (separator) {
    const parts = cleanValue.split(separator)
    if (parts.length === 3) {
      const [first, second, third] = parts
      const firstNumber = Number(first)
      const secondNumber = Number(second)
      const thirdNumber = Number(third)

      if (!Number.isNaN(firstNumber) && !Number.isNaN(secondNumber) && !Number.isNaN(thirdNumber)) {
        const hasYearFirst = first.length === 4
        const year = hasYearFirst ? firstNumber : thirdNumber
        const month = secondNumber
        const day = hasYearFirst ? thirdNumber : firstNumber

        return new Date(Date.UTC(year, Math.max(0, month - 1), Math.max(1, day)))
      }
    }
  }

  return new Date()
}

export function getDateParts(input: string): DateParts {
  const parsedDate = parseDate(input)

  return {
    day: parsedDate.getUTCDate(),
    month: parsedDate.toLocaleString('en-us', { month: 'long', timeZone: 'UTC' }),
    year: parsedDate.getUTCFullYear()
  }
}

export function readMinutes(value: string | number): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  const match = value.match(/\d+/)
  if (match) {
    return Number.parseInt(match[0], 10)
  }

  return 0
}
