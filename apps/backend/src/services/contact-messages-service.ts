import { eq, desc, isNull, isNotNull } from 'drizzle-orm';
import { contactMessages } from '../schema/contact-messages';
import type { TContactMessage, TNewContactMessage } from '../schema/contact-messages';

type TDrizzleDb = any;

export type TContactMessagesService = ReturnType<typeof createContactMessagesService>;

export function createContactMessagesService(db: TDrizzleDb) {
  async function createMessage(data: Omit<TNewContactMessage, 'id' | 'createdAt'>): Promise<TContactMessage> {
    const [message] = await db
      .insert(contactMessages)
      .values(data)
      .returning();
    
    return message;
  }

  async function getAllMessages(options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<TContactMessage[]> {
    const { limit = 50, offset = 0, unreadOnly = false } = options || {};

    let query = db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));

    if (unreadOnly) {
      query = query.where(isNull(contactMessages.read));
    }

    return await query.limit(limit).offset(offset);
  }

  async function getMessageById(id: number): Promise<TContactMessage | null> {
    const [message] = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, id))
      .limit(1);
    
    return message || null;
  }

  async function markAsRead(id: number): Promise<TContactMessage | null> {
    const [message] = await db
      .update(contactMessages)
      .set({ read: new Date().toISOString() })
      .where(eq(contactMessages.id, id))
      .returning();
    
    return message || null;
  }

  async function markAsUnread(id: number): Promise<TContactMessage | null> {
    const [message] = await db
      .update(contactMessages)
      .set({ read: null })
      .where(eq(contactMessages.id, id))
      .returning();
    
    return message || null;
  }

  async function deleteMessage(id: number): Promise<boolean> {
    const result = await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, id))
      .returning();
    
    return result.length > 0;
  }

  async function getUnreadCount(): Promise<number> {
    const result = await db
      .select({ count: db.count() })
      .from(contactMessages)
      .where(isNull(contactMessages.read));
    
    return result[0]?.count || 0;
  }

  return {
    createMessage,
    getAllMessages,
    getMessageById,
    markAsRead,
    markAsUnread,
    deleteMessage,
    getUnreadCount,
  };
}
