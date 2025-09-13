import { describe, test, expect, beforeEach, vi } from 'vitest'
import { buildWhereConditions } from '../core/where'

const mockOperators = {
  eq: vi.fn((field, value) => ({ type: 'eq', field, value })),
  gt: vi.fn((field, value) => ({ type: 'gt', field, value })),
  gte: vi.fn((field, value) => ({ type: 'gte', field, value })),
  lt: vi.fn((field, value) => ({ type: 'lt', field, value })),
  lte: vi.fn((field, value) => ({ type: 'lte', field, value })),
  ne: vi.fn((field, value) => ({ type: 'ne', field, value })),
  like: vi.fn((field, value) => ({ type: 'like', field, value })),
  inArray: vi.fn((field, value) => ({ type: 'in', field, value }))
}

vi.mock('drizzle-orm', () => mockOperators)

const mockTable = {
  age: 'age_field',
  name: 'name_field',
  status: 'status_field'
}

describe('WHERE Clause Parsing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('handles direct equality', () => {
    buildWhereConditions({ status: 'active' }, mockTable)
    expect(mockOperators.eq).toHaveBeenCalledWith('status_field', 'active')
  })

  test('parses greater than operator', () => {
    buildWhereConditions({ age: '>18' }, mockTable)
    expect(mockOperators.gt).toHaveBeenCalledWith('age_field', '18')
  })

  test('parses less than or equal operator', () => {
    buildWhereConditions({ age: '<=65' }, mockTable)
    expect(mockOperators.lte).toHaveBeenCalledWith('age_field', '65')
  })

  test('parses not equal operator', () => {
    buildWhereConditions({ status: '!inactive' }, mockTable)
    expect(mockOperators.ne).toHaveBeenCalledWith('status_field', 'inactive')
  })

  test('parses contains pattern', () => {
    buildWhereConditions({ name: '*john*' }, mockTable)
    expect(mockOperators.like).toHaveBeenCalledWith('name_field', '%john%')
  })

  test('parses starts with pattern', () => {
    buildWhereConditions({ name: 'john*' }, mockTable)
    expect(mockOperators.like).toHaveBeenCalledWith('name_field', 'john%')
  })

  test('parses ends with pattern', () => {
    buildWhereConditions({ name: '*@gmail.com' }, mockTable)
    expect(mockOperators.like).toHaveBeenCalledWith('name_field', '%@gmail.com')
  })

  test('handles array values', () => {
    buildWhereConditions({ status: ['active', 'pending'] }, mockTable)
    expect(mockOperators.inArray).toHaveBeenCalledWith('status_field', ['active', 'pending'])
  })

  test('ignores invalid fields', () => {
    const result = buildWhereConditions({ invalidField: 'value' }, mockTable)
    expect(result).toBeUndefined()
  })

  test('handles greater than or equal', () => {
    buildWhereConditions({ age: '>=21' }, mockTable)
    expect(mockOperators.gte).toHaveBeenCalledWith('age_field', '21')
  })
})