'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useMemo, useTransition } from 'react'
import type { ProjectFilter, ProjectStatus } from '../types/project'

type Props = {
  categories: Array<{ label: string; value: string }>
  statuses: ProjectStatus[]
  years: number[]
  active: ProjectFilter
}

export function ProjectFilters({ categories, statuses, years, active }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const options = useMemo(
    () => ({
      category: active.category ?? '',
      status: active.status ?? '',
      year: active.year ? String(active.year) : '',
      sort: active.sort ?? 'recent',
    }),
    [active]
  )

  function updateFilter(key: 'category' | 'status' | 'year' | 'sort', value: string) {
    const next = new URLSearchParams(searchParams?.toString() ?? '')

    if (!value) {
      next.delete(key)
    } else {
      next.set(key, value)
    }

    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`, { scroll: false })
    })
  }

  function onCategory(value: string) {
    updateFilter('category', value)
  }

  function onStatus(value: string) {
    updateFilter('status', value)
  }

  function onYear(value: string) {
    updateFilter('year', value)
  }

  function onSort(value: string) {
    updateFilter('sort', value)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <FilterField
        label="Category"
        value={options.category}
        onChange={onCategory}
        options={[
          { label: 'All categories', value: '' },
          ...categories.map(entry => ({ label: entry.label, value: entry.value }))
        ]}
        placeholder="All categories"
        loading={pending}
      />
      <FilterField
        label="Status"
        value={options.status}
        onChange={onStatus}
        options={[
          { label: 'All', value: 'all' },
          ...statuses.map((entry) => ({ label: entry === 'in progress' ? 'In progress' : entry, value: entry })),
        ]}
        placeholder="All statuses"
        loading={pending}
      />
      <FilterField
        label="Year"
        value={options.year}
        onChange={onYear}
        options={years.map((entry) => ({ label: String(entry), value: String(entry) }))}
        placeholder="All years"
        loading={pending}
      />
      <FilterField
        label="Sort"
        value={options.sort}
        onChange={onSort}
        options={[
          { label: 'Most recent', value: 'recent' },
          { label: 'Oldest', value: 'oldest' },
        ]}
        placeholder="Most recent"
        loading={pending}
      />
    </div>
  )
}

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  placeholder: string
  loading: boolean
}

function FilterField({ label, value, onChange, options, placeholder, loading }: FieldProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value)
  }

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
      <span className="flex items-center justify-between">
        <span>{label}</span>
        {loading && <span className="text-xs text-primary">Updating</span>}
      </span>
      <select
        className="h-11 rounded-lg border border-border bg-card px-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-primary"
        value={value}
        onChange={handleChange}
        aria-label={label}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
