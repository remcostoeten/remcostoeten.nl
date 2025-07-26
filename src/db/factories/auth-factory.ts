import { db } from '../connection'
import { adminUser, adminSessions } from '../schema'
import { eq } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import type { TAdminUser, TAdminSession } from '../schema'

type TCreateUser = {
  readonly email: string
  readonly name?: string
  readonly role: 'admin' | 'user'
}
type TUpdateUser = Partial<TCreateUser> & { readonly id: string }

type TAuthFactory = {
  readonly createUser: (data: TCreateUser) => Promise<TAdminUser | null>
  readonly getUserById: (id: string) => Promise<TAdminUser | null>
  readonly getUserByEmail: (email: string) => Promise<TAdminUser | null>
  readonly updateUser: (data: TUpdateUser) => Promise<TAdminUser | null>
  readonly deleteUser: (id: string) => Promise<boolean>
  readonly createSession: (userId: string, expiresInDays?: number) => Promise<TAdminSession | null>
  readonly getSessionByToken: (token: string) => Promise<TAdminSession | null>
  readonly deleteSession: (token: string) => Promise<boolean>
  readonly deleteExpiredSessions: () => Promise<number>
}

const createAuthFactory = (): TAuthFactory => {
  const createUser = async (data: TCreateUser): Promise<TAdminUser | null> => {
    try {
      const result = await db.insert(adminUser).values({
        email: data.email,
        passwordHash: 'temp-hash'
      }).returning()
      return result[0] || null
    } catch (error) {
      console.error('Failed to create user:', error)
      return null
    }
  }

  const getUserById = async (id: string): Promise<TAdminUser | null> => {
    try {
      const result = await db.select().from(adminUser).where(eq(adminUser.id, id)).limit(1)
      return result[0] || null
    } catch (error) {
      console.error('Failed to get user by id:', error)
      return null
    }
  }

  const getUserByEmail = async (email: string): Promise<TAdminUser | null> => {
    try {
      const result = await db.select().from(adminUser).where(eq(adminUser.email, email)).limit(1)
      return result[0] || null
    } catch (error) {
      console.error('Failed to get user by email:', error)
      return null
    }
  }

  const updateUser = async (data: TUpdateUser): Promise<TAdminUser | null> => {
    try {
      const result = await db
        .update(adminUser)
        .set({ email: data.email })
        .where(eq(adminUser.id, data.id))
        .returning()
      return result[0] || null
    } catch (error) {
      console.error('Failed to update user:', error)
      return null
    }
  }

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      await db.delete(adminSessions).where(eq(adminSessions.userId, id))
      
      const result = await db.delete(adminUser).where(eq(adminUser.id, id))
      return result.rowsAffected > 0
    } catch (error) {
      console.error('Failed to delete user:', error)
      return false
    }
  }

  const createSession = async (userId: string, expiresInDays = 30): Promise<TAdminSession | null> => {
    try {
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)

      const result = await db.insert(adminSessions).values({
        userId,
        token,
        expiresAt
      }).returning()
      return result[0] || null
    } catch (error) {
      console.error('Failed to create session:', error)
      return null
    }
  }

  const getSessionByToken = async (token: string): Promise<TAdminSession | null> => {
    try {
      const result = await db
        .select()
        .from(adminSessions)
        .where(eq(adminSessions.token, token))
        .limit(1)
      return result[0] || null
    } catch (error) {
      console.error('Failed to get session by token:', error)
      return null
    }
  }

  const deleteSession = async (token: string): Promise<boolean> => {
    try {
      const result = await db.delete(adminSessions).where(eq(adminSessions.token, token))
      return result.rowsAffected > 0
    } catch (error) {
      console.error('Failed to delete session:', error)
      return false
    }
  }

  const deleteExpiredSessions = async (): Promise<number> => {
    try {
      const now = new Date()
      const result = await db.delete(adminSessions).where(eq(adminSessions.expiresAt, now))
      return result.rowsAffected || 0
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
