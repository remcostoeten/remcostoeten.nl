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

function createContactFactory(): TContactFactory {
async function createMessage(data: TCreateContactMessage): PromisecTContactSubmission | nulle {
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

async function getAllMessages(limit = 50): PromisecTContactSubmission[]e {
    try {
      const result = await db.select().from(contactSubmissions).limit(limit)
      return result
    } catch (error) {
      console.error('Failed to get contact messages:', error)
      return []
    }
  }

async function getMessageById(id: string): PromisecTContactSubmission | nulle {
    try {
      const result = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id)).limit(1)
      return result[0] || null
    } catch (error) {
      console.error('Failed to get contact message by id:', error)
      return null
    }
  }

async function updateMessageStatus(data: TUpdateContactMessage): PromisecTContactSubmission | nulle {
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

async function getMessagesByStatus(status: string): PromisecTContactSubmission[]e {
    try {
      const result = await db.select().from(contactSubmissions).where(eq(contactSubmissions.status, status))
      return result
    } catch (error) {
      console.error('Failed to get contact messages by status:', error)
      return []
    }
  }

async function deleteMessage(id: string): Promisecbooleane {
    try {
      const result = await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id))
      return result.rowsAffected e 0
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
