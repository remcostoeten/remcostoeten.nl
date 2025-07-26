import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { contactFactory } from '~/db/factories/contact-factory'

export async function GET(event: APIEvent) {
  try {
    const id = event.params.id
    
    if (!id) {
      return json({ success: false, error: 'Message ID is required' }, { status: 400 })
    }

    const message = await contactFactory.getMessageById(id)
    
    if (!message) {
      return json({ success: false, error: 'Message not found' }, { status: 404 })
    }

    return json({ success: true, data: message })
  } catch (error) {
    console.error('GET /api/contact/[id] error:', error)
    return json({ success: false, error: 'Failed to fetch message' }, { status: 500 })
  }
}

export async function PUT(event: APIEvent) {
  try {
    const id = event.params.id
    const body = await event.request.json()
    
    if (!id) {
      return json({ success: false, error: 'Message ID is required' }, { status: 400 })
    }

    const { status } = body
    
    if (!status || !['new', 'read', 'replied', 'archived'].includes(status)) {
      return json({ 
        success: false, 
        error: 'Valid status is required (new, read, replied, archived)' 
      }, { status: 400 })
    }

    const message = await contactFactory.updateMessageStatus({ id, status })
    
    if (!message) {
      return json({ success: false, error: 'Failed to update message or message not found' }, { status: 404 })
    }

    return json({ success: true, data: message })
  } catch (error) {
    console.error('PUT /api/contact/[id] error:', error)
    return json({ success: false, error: 'Failed to update message' }, { status: 500 })
  }
}

export async function DELETE(event: APIEvent) {
  try {
    const id = event.params.id
    
    if (!id) {
      return json({ success: false, error: 'Message ID is required' }, { status: 400 })
    }

    const success = await contactFactory.deleteMessage(id)
    
    if (!success) {
      return json({ success: false, error: 'Failed to delete message or message not found' }, { status: 404 })
    }

    return json({ success: true, message: 'Message deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/contact/[id] error:', error)
    return json({ success: false, error: 'Failed to delete message' }, { status: 500 })
  }
}
