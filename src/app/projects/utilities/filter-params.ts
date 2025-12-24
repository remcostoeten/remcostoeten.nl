import type { ProjectFilter, ProjectStatus } from '../types/project'

export function getFilter(query: Record<string, string | string[] | undefined>): ProjectFilter {
  const category = getSingle(query.category)
  const status = getStatus(query.status)
  const year = getYear(query.year)
  const sort = getSort(query.sort)

  return {
    category,
    status,
    year,
    sort,
  }
}

function getSingle(value: string | string[] | undefined): string | null {
  if (!value) {
    return null
  }

  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

function getStatus(value: string | string[] | undefined): ProjectStatus | 'all' | undefined {
  const parsed = getSingle(value)

  if (!parsed) {
    return undefined
  }

  if (parsed === 'all') {
    return 'all'
  }

  if (parsed === 'finished' || parsed === 'in progress' || parsed === 'abandoned') {
    return parsed
  }

  return undefined
}

function getYear(value: string | string[] | undefined): number | null {
  const parsed = getSingle(value)

  if (!parsed) {
    return null
  }

  const numeric = Number(parsed)

  if (Number.isNaN(numeric)) {
    return null
  }

  return numeric
}

function getSort(value: string | string[] | undefined): 'recent' | 'oldest' | undefined {
  const parsed = getSingle(value)

  if (!parsed) {
    return undefined
  }

  if (parsed === 'oldest') {
    return 'oldest'
  }

  return 'recent'
}
