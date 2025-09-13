import { describe, test, expect, beforeEach, vi } from 'vitest'
import { initializeConnection } from '../database'

vi.mock('../database/providers/postgres', () => ({
  setupPostgres: vi.fn().mockResolvedValue('postgres-db')
}))
vi.mock('../database/providers/postgres-local', () => ({
  setupPostgresLocal: vi.fn().mockResolvedValue('postgres-local-db')
}))
vi.mock('../database/providers/sqlite', () => ({
  setupSqlite: vi.fn().mockResolvedValue('sqlite-db')
}))
vi.mock('../database/providers/turso', () => ({
  setupTurso: vi.fn().mockResolvedValue('turso-db')
}))
vi.mock('../database/config-loader', () => ({
  loadSchemaFromConfig: vi.fn().mockResolvedValue({ users: 'table' })
}))

describe('Database Connection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('detects PostgreSQL cloud provider', async () => {
    const { setupPostgres } = await import('../database/providers/postgres')
    await initializeConnection('postgresql://neon.tech/db')
    expect(setupPostgres).toHaveBeenCalledWith('postgresql://neon.tech/db', { users: 'table' })
  })

  test('detects local PostgreSQL', async () => {
    const { setupPostgresLocal } = await import('../database/providers/postgres-local')
    await initializeConnection('postgresql://localhost:5432/mydb')
    expect(setupPostgresLocal).toHaveBeenCalledWith('postgresql://localhost:5432/mydb', { users: 'table' })
  })

  test('requires auth token for Turso', async () => {
    await expect(
      initializeConnection('libsql://my-db.turso.io')
    ).rejects.toThrow('Turso requires authToken option')
  })

  test('connects to Turso with auth token', async () => {
    const { setupTurso } = await import('../database/providers/turso')
    await initializeConnection('libsql://my-db.turso.io', { authToken: 'token123' })
    expect(setupTurso).toHaveBeenCalledWith('libsql://my-db.turso.io', 'token123', { users: 'table' })
  })

  test('detects SQLite files', async () => {
    const { setupSqlite } = await import('../database/providers/sqlite')
    await initializeConnection('file:./dev.db')
    expect(setupSqlite).toHaveBeenCalledWith('file:./dev.db', { users: 'table' })
  })

  test('switches database by environment', async () => {
    process.env.NODE_ENV = 'development'
    const { setupSqlite } = await import('../database/providers/sqlite')
    
    await initializeConnection({
      development: 'file:./dev.db',
      production: 'postgresql://prod.db'
    })
    
    expect(setupSqlite).toHaveBeenCalledWith('file:./dev.db', { users: 'table' })
  })

  test('creates multiple named connections', async () => {
    const { setupPostgres } = await import('../database/providers/postgres')
    const { setupSqlite } = await import('../database/providers/sqlite')
    
    const result = await initializeConnection({
      main: 'postgresql://main.db',
      cache: 'file:./cache.db'
    })
    
    expect(setupPostgres).toHaveBeenCalledWith('postgresql://main.db', { users: 'table' })
    expect(setupSqlite).toHaveBeenCalledWith('file:./cache.db', { users: 'table' })
    expect(result).toEqual({
      main: 'postgres-db',
      cache: 'sqlite-db'
    })
  })

  test('caches connections for same URL', async () => {
    const { setupPostgres } = await import('../database/providers/postgres')
    
    await initializeConnection('postgresql://same.url')
    await initializeConnection('postgresql://same.url')
    
    expect(setupPostgres).toHaveBeenCalledTimes(1)
  })

  test('rejects unsupported URL formats', async () => {
    await expect(
      initializeConnection('mysql://unsupported.db')
    ).rejects.toThrow('Unsupported database URL format')
  })

  test('handles environment config with auth tokens', async () => {
    process.env.NODE_ENV = 'production'
    const { setupTurso } = await import('../database/providers/turso')
    
    await initializeConnection({
      development: 'file:./dev.db',
      production: {
        url: 'libsql://prod.turso.io',
        authToken: 'prod-token'
      }
    })
    
    expect(setupTurso).toHaveBeenCalledWith('libsql://prod.turso.io', 'prod-token', { users: 'table' })
  })
})