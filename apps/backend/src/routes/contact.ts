import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { TContactMessagesService } from '../services/contact-messages-service';

const contactMessageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  contact: z.string().min(1, 'Contact information is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

const idParamSchema = z.object({
  id: z.string().transform(Number),
});

const querySchema = z.object({
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
  unreadOnly: z.string().transform(val => val === 'true').optional(),
});

export function createContactRouter(contactService: TContactMessagesService) {
  const contactRouter = new Hono();

  contactRouter.post(
    '/',
    zValidator('json', contactMessageSchema),
    async (c) => {
      try {
        const messageData = c.req.valid('json');
        const message = await contactService.createMessage(messageData);

        return c.json({
          success: true,
          data: message,
          message: 'Message received successfully'
        }, 201);
      } catch (error) {
        console.error('Error creating contact message:', error);
        return c.json({
          success: false,
          message: 'Failed to submit message'
        }, 500);
      }
    }
  );

  contactRouter.get(
    '/',
    zValidator('query', querySchema),
    async (c) => {
      try {
        const query = c.req.valid('query');
        const messages = await contactService.getAllMessages(query);
        const unreadCount = await contactService.getUnreadCount();

        return c.json({
          success: true,
          data: {
            messages,
            unreadCount,
            total: messages.length
          }
        });
      } catch (error) {
        console.error('Error fetching contact messages:', error);
        return c.json({
          success: false,
          message: 'Failed to fetch messages'
        }, 500);
      }
    }
  );

  contactRouter.get(
    '/:id',
    zValidator('param', idParamSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const message = await contactService.getMessageById(id);

        if (!message) {
          return c.json({
            success: false,
            message: 'Message not found'
          }, 404);
        }

        return c.json({
          success: true,
          data: message
        });
      } catch (error) {
        console.error('Error fetching contact message:', error);
        return c.json({
          success: false,
          message: 'Failed to fetch message'
        }, 500);
      }
    }
  );

  contactRouter.patch(
    '/:id/read',
    zValidator('param', idParamSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const message = await contactService.markAsRead(id);

        if (!message) {
          return c.json({
            success: false,
            message: 'Message not found'
          }, 404);
        }

        return c.json({
          success: true,
          data: message,
          message: 'Message marked as read'
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
        return c.json({
          success: false,
          message: 'Failed to update message'
        }, 500);
      }
    }
  );

  contactRouter.patch(
    '/:id/unread',
    zValidator('param', idParamSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const message = await contactService.markAsUnread(id);

        if (!message) {
          return c.json({
            success: false,
            message: 'Message not found'
          }, 404);
        }

        return c.json({
          success: true,
          data: message,
          message: 'Message marked as unread'
        });
      } catch (error) {
        console.error('Error marking message as unread:', error);
        return c.json({
          success: false,
          message: 'Failed to update message'
        }, 500);
      }
    }
  );

  contactRouter.delete(
    '/:id',
    zValidator('param', idParamSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const deleted = await contactService.deleteMessage(id);

        if (!deleted) {
          return c.json({
            success: false,
            message: 'Message not found'
          }, 404);
        }

        return c.json({
          success: true,
          message: 'Message deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting contact message:', error);
        return c.json({
          success: false,
          message: 'Failed to delete message'
        }, 500);
      }
    }
  );

  contactRouter.get(
    '/stats/unread',
    async (c) => {
      try {
        const count = await contactService.getUnreadCount();

        return c.json({
          success: true,
          data: { unreadCount: count }
        });
      } catch (error) {
        console.error('Error fetching unread count:', error);
        return c.json({
          success: false,
          message: 'Failed to fetch unread count'
        }, 500);
      }
    }
  );

  return contactRouter;
}
