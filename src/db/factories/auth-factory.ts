import { db } from '../connection'
import { eq } from 'drizzle-orm'
import { randomBytes } from 'crypto'

// User and session types
type TUser = {
  readonly id: string
  readonly email: string
  readonly name?: string
  readonly avatarUrl?: string
  readonly role: 'admin' | 'user'
  readonly createdAt: Date
  readonly updatedAt: Date
}

type TSession = {
  readonly id: string
  readonly userId: string
  readonly token: string
  readonly expiresAt: Date
  readonly createdAt: Date
}

type TCreateUser = Omit<TUser, 'id' | 'createdAt' | 'updatedAt'>
type TUpdateUser = Partial<TCreateUser> & { readonly id: string }

type TAuthFactory = {
  readonly createUser: (data: TCreateUser) => Promise<TUser | null>
  readonly getUserById: (id: string) => Promise<TUser | null>
  readonly getUserByEmail: (email: string) => Promise<TUser | null>
  readonly updateUser: (data: TUpdateUser) => Promise<TUser | null>
  readonly deleteUser: (id: string) => Promise<boolean>
  readonly createSession: (userId: string, expiresInDays?: number) => Promise<TSession | null>
  readonly getSessionByToken: (token: string) => Promise<TSession | null>
  readonly deleteSession: (token: string) => Promise<boolean>
  readonly deleteExpiredSessions: () => Promise<number>
}

const createAuthFactory = (): TAuthFactory => {
  const createUser = async (data: TCreateUser): Promise<TUser | null> => {
    try {
      const result = await db.query(
        `INSERT INTO users (email, name, avatar_url, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [data.email, data.name, data.avatarUrl, data.role]
      )
      return result.rows[0] || null
    } catch (error) {
      console.error('Failed to create user:', error)
      return null
    }
  }

  const getUserById = async (id: string): Promise<TUser | null> => {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      )
      return result.rows[0] || null
    } catch (error) {
      console.error('Failed to get user by id:', error)
      return null
    }
  }

  const getUserByEmail = async (email: string): Promise<TUser | null> => {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      )
      return result.rows[0] || null
    } catch (error) {
      console.error('Failed to get user by email:', error)
      return null
    }
  }

  const updateUser = async (data: TUpdateUser): Promise<TUser | null> => {
    try {
      const fields: string[] = []
      const values: unknown[] = []
      let paramIndex = 1

      if (data.email !== undefined) {
        fields.push(`email = $${paramIndex++}`)
        values.push(data.email)
      }
      if (data.name !== undefined) {
        fields.push(`name = $${paramIndex++}`)
        values.push(data.name)
      }
      if (data.avatarUrl !== undefined) {
        fields.push(`avatar_url = $${paramIndex++}`)
        values.push(data.avatarUrl)
      }
      if (data.role !== undefined) {
        fields.push(`role = $${paramIndex++}`)
        values.push(data.role)
      }

      if (fields.length === 0) {
        throw new Error('No fields to update')
      }

      fields.push(`updated_at = NOW()`)
      values.push(data.id)

      const result = await db.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      )
      return result.rows[0] || null
    } catch (error) {
      console.error('Failed to update user:', error)
      return null
    }
  }

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      // First delete all sessions for this user
      await db.query('DELETE FROM sessions WHERE user_id = $1', [id])
      
      // Then delete the user
      const result = await db.query('DELETE FROM users WHERE id = $1', [id])
      return result.rowCount !== null && result.rowCount > 0
    } catch (error) {
      console.error('Failed to delete user:', error)
      return false
    }
  }

  const createSession = async (userId: string, expiresInDays = 30): Promise<TSession | null> => {
    try {
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)

      const result = await db.query(
        `INSERT INTO sessions (user_id, token, expires_at) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [userId, token, expiresAt]
      )
      return result.rows[0] || null
    } catch (error) {
      console.error('Failed to create session:', error)
      return null
    }
  }

  const getSessionByToken = async (token: string): Promise<TSession | null> => {
    try {
      const result = await db.query(
        'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
        [token]
      )
      return result.rows[0] || null
    } catch (error) {
      console.error('Failed to get session by token:', error)
      return null
    }
  }

  const deleteSession = async (token: string): Promise<boolean> => {
    try {
      const result = await db.query('DELETE FROM sessions WHERE token = $1', [token])
      return result.rowCount !== null && result.rowCount > 0
    } catch (error) {
      console.error('Failed to delete session:', error)
      return false
    }
  }

  const deleteExpiredSessions = async (): Promise<number> => {
    try {
      const result = await db.query('DELETE FROM sessions WHERE expires_at <= NOW()')
      return result.rowCount || 0
    } catch (error) {
      console.error('Failed to delete expired sessions:', error)
      return 0
    }
  }

  return {
    createUser,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser,
    createSession,
    getSessionByToken,
    deleteSession,
    deleteExpiredSessions
  }
}

export const authFactory = createAuthFactory()
