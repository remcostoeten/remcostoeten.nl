import { db } from '../connection'
import { contactSubmissions } from '../schema'
import { eq } from 'drizzle-orm'
import type { TContactSubmission } from '../schema'

type TCreateContactMessage = {
  readonly name: string
  readonly email: string
  readonly subject: string
  readonly message: string
}
type TUpdateContactMessage = { readonly id: string; readonly status: string }

type TContactFactory = {
  readonly createMessage: (data: TCreateContactMessage) => Promise<TContactSubmission | null>
  readonly getAllMessages: (limit?: number) => Promise<TContactSubmission[]>
  readonly getMessageById: (id: string) => Promise<TContactSubmission | null>
  readonly updateMessageStatus: (data: TUpdateContactMessage) => Promise<TContactSubmission | null>
  readonly getMessagesByStatus: (status: string) => Promise<TContactSubmission[]>
  readonly deleteMessage: (id: string) => Promise<boolean>
}

const createContactFactory = (): TContactFactory => {
  const createMessage = async (data: TCreateContactMessage): Promise<TContactSubmission | null> => {
    try {
      const result = await db.insert(contactSubmissions).values({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message
      }).returning()
      return result[0] || null
    } catch (error) {
      console.error('Failed to create contact message:', error)
      return null
    }
  }

  const getAllMessages = async (limit = 50): Promise<TContactSubmission[]> => {
    try {
      const result = await db.select().from(contactSubmissions).limit(limit)
      return result
    } catch (error) {
      console.error('Failed to get contact messages:', error)
      return []
    }
  }

  const getMessageById = async (id: string): Promise<TContactSubmission | null> => {
    try {
      const result = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id)).limit(1)
      return result[0] || null
    } catch (error) {
      console.error('Failed to get contact message by id:', error)
      return null
    }
  }

  const updateMessageStatus = async (data: TUpdateContactMessage): Promise<TContactSubmission | null> => {
    try {
      const result = await db
        .update(contactSubmissions)
        .set({ status: data.status })
        .where(eq(contactSubmissions.id, data.id))
        .returning()
      return result[0] || null
    } catch (error) {
      console.error('Failed to update contact message status:', error)
      return null
    }
  }

  const getMessagesByStatus = async (status: string): Promise<TContactSubmission[]> => {
    try {
      const result = await db.select().from(contactSubmissions).where(eq(contactSubmissions.status, status))
      return result
    } catch (error) {
      console.error('Failed to get contact messages by status:', error)
      return []
    }
  }

  const deleteMessage = async (id: string): Promise<boolean> => {
    try {
      const result = await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id))
      return result.rowsAffected > 0
    } catch (error) {
      console.error('Failed to delete contact message:', error)
      return false
    }
  }

  return {
    createMessage,
    getAllMessages,
    getMessageById,
    updateMessageStatus,
    getMessagesByStatus,
    deleteMessage
  }
}

export const contactFactory = createContactFactory()
