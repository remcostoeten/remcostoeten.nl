import { db } from '../connection'
import { eq } from 'drizzle-orm'

// Contact message type
type TContactMessage = {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly subject: string
  readonly message: string
  readonly status: 'new' | 'read' | 'replied' | 'archived'
  readonly createdAt: Date
  readonly updatedAt: Date
}

type TCreateContactMessage = Omit<TContactMessage, 'id' | 'status' | 'createdAt' | 'updatedAt'>
type TUpdateContactMessage = Partial<Pick<TContactMessage, 'status'>> & { readonly id: string }

type TContactFactory = {
  readonly createMessage: (data: TCreateContactMessage) => Promise<TContactMessage | null>
  readonly getAllMessages: (limit?: number) => Promise<TContactMessage[]>
  readonly getMessageById: (id: string) => Promise<TContactMessage | null>
  readonly updateMessageStatus: (data: TUpdateContactMessage) => Promise<TContactMessage | null>
  readonly getMessagesByStatus: (status: TContactMessage['status']) => Promise<TContactMessage[]>
  readonly deleteMessage: (id: string) => Promise<boolean>
}

const createContactFactory = (): TContactFactory => {
  const createMessage = async (data: TCreateContactMessage): Promise<TContactMessage | null> => {
    try {
      // For now, using raw query since we don't have the contact_messages table in schema yet
      const result = await db.query(
        `INSERT INTO contact_messages (name, email, subject, message, status) 
         VALUES ($1, $2, $3, $4, 'new') 
         RETURNING *`,
        [data.name, data.email, data.subject, data.message]
      )
      return result.rows[0] || null
    } catch (error) {
      console.error('Failed to create contact message:', error)
      return null
    }
  }

  const getAllMessages = async (limit = 50): Promise<TContactMessage[]> => {
    try {
      const result = await db.query(
        'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT $1',
        [limit]
      )
      return result.rows
    } catch (error) {
      console.error('Failed to get contact messages:', error)
      return []
    }
  }

  const getMessageById = async (id: string): Promise<TContactMessage | null> => {
    try {
      const result = await db.query(
        'SELECT * FROM contact_messages WHERE id = $1',
        [id]
      )
      return result.rows[0] || null
    } catch (error) {
      console.error('Failed to get contact message by id:', error)
      return null
    }
  }

  const updateMessageStatus = async (data: TUpdateContactMessage): Promise<TContactMessage | null> => {
    try {
      const result = await db.query(
        'UPDATE contact_messages SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [data.status, data.id]
      )
      return result.rows[0] || null
    } catch (error) {
      console.error('Failed to update contact message status:', error)
      return null
    }
  }

  const getMessagesByStatus = async (status: TContactMessage['status']): Promise<TContactMessage[]> => {
    try {
      const result = await db.query(
        'SELECT * FROM contact_messages WHERE status = $1 ORDER BY created_at DESC',
        [status]
      )
      return result.rows
    } catch (error) {
      console.error('Failed to get contact messages by status:', error)
      return []
    }
  }

  const deleteMessage = async (id: string): Promise<boolean> => {
    try {
      const result = await db.query(
        'DELETE FROM contact_messages WHERE id = $1',
        [id]
      )
      return result.rowCount !== null && result.rowCount > 0
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
