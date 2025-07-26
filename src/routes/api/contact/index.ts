import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { contactFactory } from '~/db/factories/contact-factory'

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url)
    const limit = url.searchParams.get('limit')
    const status = url.searchParams.get('status') as 'new' | 'read' | 'replied' | 'archived' | null

    if (status) {
      const messages = await contactFactory.getMessagesByStatus(status)
      return json({ success: true, data: messages })
    }

    const messages = await contactFactory.getAllMessages(limit ? parseInt(limit) : undefined)
    return json({ success: true, data: messages })
  } catch (error) {
    console.error('GET /api/contact error:', error)
    return json({ success: false, error: 'Failed to fetch contact messages' }, { status: 500 })
  }
}

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return json({ 
        success: false, 
        error: 'Missing required fields: name, email, subject, message' 
      }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return json({ 
        success: false, 
        error: 'Invalid email format' 
      }, { status: 400 })
    }

    const contactMessage = await contactFactory.createMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    })

    if (!contactMessage) {
      return json({ success: false, error: 'Failed to create contact message' }, { status: 500 })
    }

    return json({ 
      success: true, 
      message: 'Contact message sent successfully',
      data: contactMessage 
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/contact error:', error)
    return json({ success: false, error: 'Failed to send contact message' }, { status: 500 })
  }
}
